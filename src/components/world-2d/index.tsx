import { useDungeon } from '@contexts/dungeon/use-dungeon';
import { useTheme } from '@contexts/theme/context';
import { createLog } from '@helpers/log';
import { isPointInRoom, MAX_ROOMS, Room, StrategyType } from '@model/dungeon';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ControlsPanel } from './components/controls-panel';
import { MiniMap } from './components/mini-map';
import { renderDungeon } from './helpers';

const log = createLog('World2D');

export const World2D = () => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    dungeon,
    generateRoomsAround,
    generationProgress,
    isGenerating,
    regenerate,
    seed,
    setSeed
  } = useDungeon();

  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyType>('random');
  const [fillSpace, setFillSpace] = useState(false);
  // const [seed, setSeed] = useState(dungeon?.seed || 1);
  // const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1_000_000));
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
  const [canvasSize, setCanvasSize] = useState({ height: 0, width: 0 });

  // Handle window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setCanvasSize({ height, width });
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
    if (!canvas) {
      return;
    }

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
    renderDungeon(canvasRef.current, dungeon, viewportOffset, {
      showConnections,
      showDoors,
      showRooms,
      theme
    });
  }, [
    canvasSize,
    dungeon,
    showConnections,
    showRooms,
    showDoors,
    viewportOffset,
    highlightedRoom,
    isGenerating,
    generationProgress,
    theme
  ]);

  const regenerateDungeon = useCallback(async () => {
    const start = performance.now();
    resetView();

    try {
      await regenerate({
        maxRooms: fillSpace ? MAX_ROOMS : 5,
        seed,
        strategy: selectedStrategy
      });
    } finally {
      const end = performance.now();
      log.debug(`Dungeon generated in ${end - start}ms`);
    }
  }, [fillSpace, seed, selectedStrategy, regenerate]);

  const resetView = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    setViewportOffset({
      x: canvas.width / 2,
      y: canvas.height / 2
    });
  };

  useEffect(() => {
    regenerateDungeon();
  }, [seed, selectedStrategy, regenerateDungeon]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setDragStart({
      x: event.clientX - viewportOffset.x,
      y: event.clientY - viewportOffset.y
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dungeon) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - viewportOffset.x;
    const y = event.clientY - rect.top - viewportOffset.y;

    // Check if we're over a room
    const roomUnderPointer = dungeon.rooms.find(room =>
      isPointInRoom({ x, y }, room)
    );
    setIsOverRoom(!!roomUnderPointer);
    setHighlightedRoom(roomUnderPointer || null);

    if (!isDragging) {
      return;
    }

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
    if (!dungeon || isDragging) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - viewportOffset.x;
    const y = event.clientY - rect.top - viewportOffset.y;

    // Find clicked room
    const clickedRoom = dungeon.rooms.find(room =>
      isPointInRoom({ x, y }, room)
    );

    if (clickedRoom) {
      generateRoomsAround({ recurseCount, room: clickedRoom });
    }
  };

  return (
    <>
      <ControlsPanel
        fillSpace={fillSpace}
        isGenerating={isGenerating}
        onFillSpaceChange={setFillSpace}
        onRecurseCountChange={setRecurseCount}
        onRegenerate={regenerateDungeon}
        onResetView={resetView}
        onSeedChange={setSeed}
        onShowConnectionsChange={setShowConnections}
        onShowDoorsChange={setShowDoors}
        onShowRoomsChange={setShowRooms}
        onStrategyChange={setSelectedStrategy}
        recurseCount={recurseCount}
        seed={seed}
        selectedStrategy={selectedStrategy}
        showConnections={showConnections}
        showDoors={showDoors}
        showRooms={showRooms}
      />
      <canvas
        className="absolute inset-0 border-none cursor-grab active:cursor-grabbing"
        onClick={handlePointerClick}
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={canvasRef}
        style={{
          cursor: isDragging ? 'grabbing' : isOverRoom ? 'pointer' : 'grab'
        }}
      />
      <MiniMap dungeon={dungeon} />
    </>
  );
};
