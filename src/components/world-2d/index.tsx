import { useEffect, useRef, useState } from 'react';
import './index.css';
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

const log = createLog('World2D');

export const World2D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dungeon, setDungeon] = useState<DungeonData | null>(null);
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyType>('random');
  const [fillSpace, setFillSpace] = useState(false);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [showConnections, setShowConnections] = useState(true);
  const [showRooms, setShowRooms] = useState(true);
  const [showDoors, setShowDoors] = useState(true);
  const [viewportOffset, setViewportOffset] = useState(() => ({
    x: CANVAS_SIZE / 2,
    y: CANVAS_SIZE / 2
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isOverRoom, setIsOverRoom] = useState(false);
  const [highlightedRoom, setHighlightedRoom] = useState<Room | null>(null);

  const regenerateDungeon = () => {
    const start = performance.now();
    log.debug('Regenerating dungeon');
    setDungeon(generateDungeon(fillSpace, selectedStrategy, seed));
    const end = performance.now();
    log.debug(`Dungeon generated in ${end - start}ms`);
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
  }, [
    dungeon,
    showConnections,
    showRooms,
    showDoors,
    viewportOffset,
    highlightedRoom
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
      const newDungeon = generateRoomsAround(dungeon, clickedRoom);
      setDungeon(newDungeon);
    }
  };

  return (
    <div className="world-2d">
      <div className="controls">
        <select
          value={selectedStrategy}
          onChange={e => setSelectedStrategy(e.target.value as StrategyType)}
        >
          <option value="random">Random Strategy</option>
          <option value="growth">Growth Strategy</option>
          <option value="type">Type Strategy</option>
          <option value="branch">Branch Strategy</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={fillSpace}
            onChange={e => setFillSpace(e.target.checked)}
          />
          Fill Space
        </label>
        <input
          type="number"
          value={seed}
          onChange={e => setSeed(parseInt(e.target.value, 10) || 0)}
          placeholder="Enter seed"
        />
        <label>
          <input
            type="checkbox"
            checked={showConnections}
            onChange={e => setShowConnections(e.target.checked)}
          />
          Show Connections
        </label>
        <label>
          <input
            type="checkbox"
            checked={showRooms}
            onChange={e => setShowRooms(e.target.checked)}
          />
          Show Rooms
        </label>
        <label>
          <input
            type="checkbox"
            checked={showDoors}
            onChange={e => setShowDoors(e.target.checked)}
          />
          Show Doors
        </label>
        <button onClick={regenerateDungeon}>Regenerate</button>
        <button onClick={resetView}>Reset View</button>
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
        style={{
          cursor: isDragging ? 'grabbing' : isOverRoom ? 'pointer' : 'grab'
        }}
      />
    </div>
  );
};
