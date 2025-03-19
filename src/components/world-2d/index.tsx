import { darkenColor } from '@helpers/colour';
import { createLog } from '@helpers/log';
import {
  DungeonData,
  generateDungeon,
  generateRoomsAround,
  getRoomCenter,
  isPointInRoom,
  Room,
  StrategyType
} from '@model/dungeon';
import { CANVAS_SIZE } from '@model/dungeon/constants';
import { useEffect, useRef, useState } from 'react';

const log = createLog('World2D');

export const World2D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dungeon, setDungeon] = useState<DungeonData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyType>('random');
  const [fillSpace, setFillSpace] = useState(false);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [showConnections, setShowConnections] = useState(true);
  const [showRooms, setShowRooms] = useState(true);
  const [showDoors, setShowDoors] = useState(true);
  const [recurseCount, setRecurseCount] = useState(1);
  const [viewportOffset, setViewportOffset] = useState(() => ({
    x: CANVAS_SIZE / 2,
    y: CANVAS_SIZE / 2
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isOverRoom, setIsOverRoom] = useState(false);
  const [highlightedRoom, setHighlightedRoom] = useState<Room | null>(null);

  const regenerateDungeon = async () => {
    const start = performance.now();
    log.debug('Regenerating dungeon');
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const newDungeon = await generateDungeon(
        fillSpace,
        selectedStrategy,
        seed,
        intermediateDungeon => {
          setDungeon(intermediateDungeon);
          // Calculate progress based on room count
          const maxRooms = fillSpace ? 100 : 20; // Approximate max rooms
          const progress = Math.min(
            100,
            (intermediateDungeon.rooms.length / maxRooms) * 100
          );
          setGenerationProgress(progress);
        }
      );
      setDungeon(newDungeon);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      const end = performance.now();
      log.debug(`Dungeon generated in ${end - start}ms`);
      resetView();
    }
  };

  const resetView = () => {
    setViewportOffset({
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE / 2
    });
  };

  useEffect(() => {
    regenerateDungeon();
  }, [seed, selectedStrategy]);

  useEffect(() => {
    if (!dungeon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply viewport transform
    ctx.save();
    ctx.translate(viewportOffset.x, viewportOffset.y);

    const colourIncrement = 1 / (dungeon.maxDepth || 1);

    // Draw rooms
    if (showRooms) {
      dungeon.rooms.forEach(room => {
        if (room.isCentral) {
          ctx.fillStyle = '#4a9eff';
        } else {
          // Start with a light gray and darken based on depth
          const baseColor = '#e0e0e0';
          const depth = room.depth || 0;
          ctx.fillStyle = darkenColor(baseColor, depth * colourIncrement);
        }
        ctx.fillRect(room.x, room.y, room.width, room.height);

        // Draw highlight if this is the highlighted room
        if (room === highlightedRoom) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(room.x, room.y, room.width, room.height);
        }

        ctx.strokeStyle = room === highlightedRoom ? '#ffffff' : '#AAA';
        ctx.lineWidth = room === highlightedRoom ? 2 : 1;
        ctx.strokeRect(room.x, room.y, room.width, room.height);

        // Draw room text
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          room.isCentral ? 'Start' : `${room.depth || 0}`,
          room.x + room.width / 2,
          room.y + room.height / 2
        );
      });
    }

    // Draw doors
    if (showDoors) {
      ctx.fillStyle = '#FF893F';
      dungeon.doors.forEach(door => {
        ctx.fillRect(door.position.x, door.position.y, door.width, door.height);
      });
    }

    // Draw room connection indicators if enabled
    if (showConnections) {
      ctx.strokeStyle = '#00ff00aa';
      ctx.lineWidth = 2;
      dungeon.doors.forEach(door => {
        // Draw a line between rooms that have doors
        const center1 = getRoomCenter(door.room1);
        const center2 = getRoomCenter(door.room2);
        ctx.beginPath();
        ctx.moveTo(center1.x, center1.y);
        ctx.lineTo(center2.x, center2.y);
        ctx.stroke();
      });
    }

    ctx.restore();

    // Draw room count at bottom right
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      `Rooms: ${dungeon.rooms.length}`,
      canvas.width - 10,
      canvas.height - 10
    );

    // Draw generation progress at bottom left if generating
    if (isGenerating) {
      ctx.textAlign = 'left';
      ctx.fillText(
        `Generating... ${Math.round(generationProgress)}%`,
        10,
        canvas.height - 10
      );
    }
  }, [
    dungeon,
    showConnections,
    showRooms,
    showDoors,
    viewportOffset,
    highlightedRoom,
    isGenerating,
    generationProgress
  ]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setDragStart({
      x: event.clientX - viewportOffset.x,
      y: event.clientY - viewportOffset.y
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dungeon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - viewportOffset.x;
    const y = event.clientY - rect.top - viewportOffset.y;

    // Check if we're over a room
    const roomUnderPointer = dungeon.rooms.find(room =>
      isPointInRoom({ x, y }, room)
    );
    setIsOverRoom(!!roomUnderPointer);
    setHighlightedRoom(roomUnderPointer || null);

    if (!isDragging) return;

    setViewportOffset({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  };

  const handlePointerClick = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dungeon || isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - viewportOffset.x;
    const y = event.clientY - rect.top - viewportOffset.y;

    // Find clicked room
    const clickedRoom = dungeon.rooms.find(room =>
      isPointInRoom({ x, y }, room)
    );

    if (clickedRoom) {
      const newDungeon = generateRoomsAround({
        dungeon,
        targetRoom: clickedRoom,
        recurseCount
      });
      setDungeon(newDungeon);
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-4 p-4 w-screen h-screen bg-[#1e1e1e]">
      <div className="flex flex-wrap gap-4 items-center p-2 bg-[#2a2a2a] rounded fixed top-5 left-1/2 -translate-x-1/2 z-50">
        <select
          value={selectedStrategy}
          onChange={e => setSelectedStrategy(e.target.value as StrategyType)}
          className="p-1.5 bg-[#3d3d3d] text-white border border-[#4d4d4d] rounded text-sm"
        >
          <option value="random">Random Strategy</option>
          <option value="growth">Growth Strategy</option>
          <option value="type">Type Strategy</option>
          <option value="branch">Branch Strategy</option>
        </select>
        <label className="flex items-center gap-2 text-white text-sm">
          <input
            type="checkbox"
            checked={fillSpace}
            onChange={e => setFillSpace(e.target.checked)}
            className="w-4 h-4 accent-[#4a9eff]"
          />
          Fill Space
        </label>
        <input
          type="number"
          value={seed}
          onChange={e => setSeed(parseInt(e.target.value, 10) || 0)}
          placeholder="Enter seed"
          className="p-1.5 bg-[#3d3d3d] text-white border border-[#4d4d4d] rounded text-sm w-[100px]"
        />
        <input
          type="number"
          value={recurseCount}
          onChange={e =>
            setRecurseCount(Math.max(1, parseInt(e.target.value, 10) || 1))
          }
          min="1"
          placeholder="Recurse count"
          className="p-1.5 bg-[#3d3d3d] text-white border border-[#4d4d4d] rounded text-sm w-[100px]"
        />
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={showConnections}
              onChange={e => setShowConnections(e.target.checked)}
              className="w-4 h-4 accent-[#4a9eff]"
            />
            Show Connections
          </label>
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={showRooms}
              onChange={e => setShowRooms(e.target.checked)}
              className="w-4 h-4 accent-[#4a9eff]"
            />
            Show Rooms
          </label>
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={showDoors}
              onChange={e => setShowDoors(e.target.checked)}
              className="w-4 h-4 accent-[#4a9eff]"
            />
            Show Doors
          </label>
        </div>
        <button
          onClick={regenerateDungeon}
          disabled={isGenerating}
          className="px-4 py-1.5 bg-[#4a9eff] text-white border-none rounded cursor-pointer text-sm transition-colors hover:bg-[#3a8eef] disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Regenerate'}
        </button>
        <button
          onClick={resetView}
          className="px-4 py-1.5 bg-[#4a9eff] text-white border-none rounded cursor-pointer text-sm transition-colors hover:bg-[#3a8eef]"
        >
          Reset View
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        onClick={handlePointerClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="border border-[#444] bg-[#1e1e1e] cursor-grab active:cursor-grabbing"
        style={{
          cursor: isDragging ? 'grabbing' : isOverRoom ? 'pointer' : 'grab'
        }}
      />
    </div>
  );
};
