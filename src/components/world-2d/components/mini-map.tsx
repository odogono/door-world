import { useTheme } from '@contexts/theme/context';
import { DungeonData } from '@model/dungeon';
import { useEffect, useRef } from 'react';
import { renderDungeon } from '../helpers';

type MiniMapProps = {
  dungeon: DungeonData | null;
  size?: number;
};

export const MiniMap = ({ dungeon, size = 200 }: MiniMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;

    // Calculate the bounds of the dungeon
    if (!dungeon || !dungeon.rooms.length) {
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    dungeon.rooms.forEach(room => {
      minX = Math.min(minX, room.x);
      minY = Math.min(minY, room.y);
      maxX = Math.max(maxX, room.x + room.width);
      maxY = Math.max(maxY, room.y + room.height);
    });

    // Calculate scale based on the maximum extent from origin in any direction
    const maxExtent = Math.max(
      Math.abs(minX),
      Math.abs(maxX),
      Math.abs(minY),
      Math.abs(maxY)
    );
    const scale = size / (maxExtent * 2.2); // 2.2 to add some padding

    // Position (0,0) at the center of the minimap
    const viewportOffset = {
      x: size / 2,
      y: size / 2
    };

    // Save the current context state
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(scale, scale);

    // Render the dungeon with the calculated offset
    renderDungeon(canvas, dungeon, viewportOffset, {
      showConnections: false,
      showDoors: false,
      showLegend: false,
      showRooms: true,
      theme
    });

    // Restore the context state
    ctx.restore();
  }, [dungeon, size, theme]);

  return (
    <canvas
      className="absolute bottom-14 right-4 border border-gray-600 rounded-lg"
      height={size}
      ref={canvasRef}
      width={size}
    />
  );
};
