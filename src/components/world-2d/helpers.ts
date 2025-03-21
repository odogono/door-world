import { Theme } from '@contexts/theme/types';
import { darkenColor } from '@helpers/colour';
import { DungeonData, getRoomCenter, Room } from '@model/dungeon';
import { Position } from '@model/dungeon/types';

type RenderDungeonOptions = {
  generationProgress?: number;
  isGenerating?: boolean;
  showConnections?: boolean;
  showDoors?: boolean;
  showLegend?: boolean;
  showRooms?: boolean;
  theme?: Theme;
};

export const renderDungeon = (
  canvas: HTMLCanvasElement | null,
  dungeon: DungeonData | null,
  viewportOffset: Position,
  options: RenderDungeonOptions = {}
) => {
  const {
    generationProgress = 0,
    isGenerating = false,
    showConnections = true,
    showDoors = true,
    showLegend = true,
    showRooms = true,
    theme = 'dark'
  } = options;

  if (!canvas || !dungeon) {
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  // Clear canvas
  ctx.fillStyle = theme === 'dark' ? '#1e1e1e' : '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply viewport transform
  ctx.save();
  ctx.translate(viewportOffset.x, viewportOffset.y);

  if (showRooms) {
    renderRooms(ctx, dungeon, null);
  }
  if (showDoors) {
    renderDoors(ctx, dungeon);
  }
  if (showConnections) {
    renderConnections(ctx, dungeon);
  }

  ctx.restore();

  if (showLegend) {
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
  }

  return ctx;
};

export const renderRooms = (
  ctx: CanvasRenderingContext2D,
  dungeon: DungeonData,
  highlightedRoom: Room | null
) => {
  const colourIncrement = 1 / (dungeon.maxDepth || 1);

  dungeon.rooms.forEach(room => {
    renderRoom({ colourIncrement, ctx, highlightedRoom, room });
  });
};

export const renderDoors = (
  ctx: CanvasRenderingContext2D,
  dungeon: DungeonData
) => {
  dungeon.doors.forEach(door => {
    ctx.fillStyle = '#FF893F';
    ctx.fillRect(door.position.x, door.position.y, door.width, door.height);
  });
};

export const renderConnections = (
  ctx: CanvasRenderingContext2D,
  dungeon: DungeonData
) => {
  ctx.strokeStyle = '#00ff00aa';
  ctx.lineWidth = 2;

  dungeon.doors.forEach(door => {
    const center1 = getRoomCenter(dungeon, door.room1);
    const center2 = getRoomCenter(dungeon, door.room2);
    ctx.beginPath();
    ctx.moveTo(center1.x, center1.y);
    ctx.lineTo(center2.x, center2.y);
    ctx.stroke();
  });
};

type RenderRoomProps = {
  colourIncrement: number;
  ctx: CanvasRenderingContext2D;
  highlightedRoom: Room | null;
  room: Room;
};

export const renderRoom = ({
  colourIncrement,
  ctx,
  highlightedRoom,
  room
}: RenderRoomProps) => {
  if (room.isCentral) {
    ctx.fillStyle = '#4a9eff';
  } else {
    const baseColor = '#e0e0e0';
    const depth = room.depth || 0;
    ctx.fillStyle = darkenColor(baseColor, depth * colourIncrement);
  }
  ctx.fillRect(room.x, room.y, room.width, room.height);

  if (room === highlightedRoom) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(room.x, room.y, room.width, room.height);
  }

  ctx.strokeStyle = room === highlightedRoom ? '#ffffff' : '#AAA';
  ctx.lineWidth = room === highlightedRoom ? 2 : 1;
  ctx.strokeRect(room.x, room.y, room.width, room.height);

  ctx.fillStyle = '#ffffff';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    room.isCentral ? 'Start' : `${room.depth || 0}`,
    room.x + room.width / 2,
    room.y + room.height / 2
  );
};
