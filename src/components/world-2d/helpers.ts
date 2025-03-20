import { darkenColor } from '@helpers/colour';
import { DungeonData, getRoomCenter, Room } from '@model/dungeon';

export const renderRooms = (
  ctx: CanvasRenderingContext2D,
  dungeon: DungeonData,
  highlightedRoom: Room | null
) => {
  const colourIncrement = 1 / (dungeon.maxDepth || 1);

  dungeon.rooms.forEach(room => {
    renderRoom({ ctx, room, highlightedRoom, colourIncrement });
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
  ctx: CanvasRenderingContext2D;
  room: Room;
  highlightedRoom: Room | null;
  colourIncrement: number;
};

export const renderRoom = ({
  ctx,
  room,
  highlightedRoom,
  colourIncrement
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
