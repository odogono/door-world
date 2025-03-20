import { createLog } from '@helpers/log';
import {
  DungeonData,
  generateDungeon,
  generateRoomsAround,
  isPointInRoom,
  MAX_ROOMS,
  NUM_ROOMS_PER_CLICK,
  Room,
  StrategyType
} from '@model/dungeon';
import { useEffect, useRef, useState } from 'react';
import { ControlsPanel } from './components/controls-panel';
import { renderConnections, renderDoors, renderRooms } from './helpers';

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
    x: 0,
    y: 0
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isOverRoom, setIsOverRoom] = useState(false);
  const [highlightedRoom, setHighlightedRoom] = useState<Room | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Handle window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setCanvasSize({ width, height });
    };

    // Initial size
    updateCanvasSize();

    // Add resize listener
    window.addEventListener('resize', updateCanvasSize);

    // Cleanup
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Update canvas dimensions when size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to match window size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
  }, [canvasSize]);

  // Update viewport offset when canvas size changes
  useEffect(() => {
    setViewportOffset({
      x: canvasSize.width / 2,
      y: canvasSize.height / 2
    });
  }, [canvasSize]);

  // Draw dungeon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dungeon) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply viewport transform
    ctx.save();
    ctx.translate(viewportOffset.x, viewportOffset.y);

    // Draw rooms
    if (showRooms) {
      renderRooms(ctx, dungeon, highlightedRoom);
    }

    // Draw doors
    if (showDoors) {
      renderDoors(ctx, dungeon);
    }

    // Draw connections
    if (showConnections) {
      renderConnections(ctx, dungeon);
    }

    ctx.restore();

    // Draw room count and generation progress
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      `Rooms: ${dungeon.rooms.length}`,
      canvas.width - 10,
      canvas.height - 10
    );

    if (isGenerating) {
      ctx.textAlign = 'left';
      ctx.fillText(
        `Generating... ${Math.round(generationProgress)}%`,
        10,
        canvas.height - 10
      );
    }
  }, [
    canvasSize,
    dungeon,
    showConnections,
    showRooms,
    showDoors,
    viewportOffset,
    highlightedRoom,
    isGenerating,
    generationProgress
  ]);

  const regenerateDungeon = async () => {
    const start = performance.now();
    log.debug('Regenerating dungeon');
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const newDungeon = await generateDungeon({
        strategy: selectedStrategy,
        seed,
        maxRooms: fillSpace ? MAX_ROOMS : 5,
        maxAttempts: fillSpace ? 1000 : 100,
        onProgress: intermediateDungeon => {
          setDungeon(intermediateDungeon);
          // Calculate progress based on room count
          const maxRooms = fillSpace ? 100 : 20; // Approximate max rooms
          const progress = Math.min(
            100,
            (intermediateDungeon.rooms.length / maxRooms) * 100
          );
          setGenerationProgress(progress);
        }
      });
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    setViewportOffset({
      x: canvas.width / 2,
      y: canvas.height / 2
    });
  };

  useEffect(() => {
    regenerateDungeon();
  }, [seed, selectedStrategy]);

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
    <div className="relative flex flex-col items-center gap-4 w-screen h-screen bg-[#1e1e1e] overflow-hidden">
      <ControlsPanel
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
        fillSpace={fillSpace}
        onFillSpaceChange={setFillSpace}
        seed={seed}
        onSeedChange={setSeed}
        recurseCount={recurseCount}
        onRecurseCountChange={setRecurseCount}
        showConnections={showConnections}
        onShowConnectionsChange={setShowConnections}
        showRooms={showRooms}
        onShowRoomsChange={setShowRooms}
        showDoors={showDoors}
        onShowDoorsChange={setShowDoors}
        isGenerating={isGenerating}
        onRegenerate={regenerateDungeon}
        onResetView={resetView}
      />
      <canvas
        ref={canvasRef}
        onClick={handlePointerClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 border-none bg-[#1e1e1e] cursor-grab active:cursor-grabbing"
        style={{
          cursor: isDragging ? 'grabbing' : isOverRoom ? 'pointer' : 'grab'
        }}
      />
    </div>
  );
};
