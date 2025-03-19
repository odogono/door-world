import { useEffect, useRef, useState } from 'react';
import './index.css';
import {
  DungeonData,
  generateDungeon,
  generateRoomsAround,
  getRoomCenter,
  isPointInRoom,
  Room,
  StrategyType
} from '@model/dungeon';

export const World2D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dungeon, setDungeon] = useState<DungeonData | null>(null);
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyType>('random');
  const [fillSpace, setFillSpace] = useState(false);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [showConnections, setShowConnections] = useState(true);

  const regenerateDungeon = () => {
    setDungeon(generateDungeon(fillSpace, selectedStrategy, seed));
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

    // Draw rooms
    dungeon.rooms.forEach(room => {
      ctx.fillStyle = room.isCentral ? '#4a9eff' : '#2d2d2d';
      ctx.fillRect(room.x, room.y, room.width, room.height);

      ctx.strokeStyle = '#888';
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

    // Draw doors
    ctx.fillStyle = '#FF893F';
    dungeon.doors.forEach(door => {
      ctx.fillRect(door.position.x, door.position.y, door.width, door.height);
    });

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
  }, [dungeon, showConnections]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dungeon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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
        <button onClick={regenerateDungeon}>Regenerate</button>
      </div>
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        onClick={handleCanvasClick}
      />
    </div>
  );
};
