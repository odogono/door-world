import { prngIntRange, prngShuffle } from '@helpers/random';
import {
  ROOM_SIZE_LARGE,
  ROOM_SIZE_MEDIUM,
  ROOM_SIZE_SMALL
} from './constants';
import { DungeonData, Room, RoomType } from './types';

export const getMaxRoomDepth = (rooms: Room[]): number => {
  return Math.max(...rooms.map(room => room.depth || 0));
};

const getRangeForRoomType = (type: RoomType) => {
  switch (type) {
    case RoomType.LARGE:
      return ROOM_SIZE_LARGE;
    case RoomType.SMALL:
      return ROOM_SIZE_SMALL;
    case RoomType.NORMAL:
    default:
      return ROOM_SIZE_MEDIUM;
  }
};

export const getRoomSizeForType = (
  type: RoomType,
  seed: number
): [number, { width: number; height: number }] => {
  const range = getRangeForRoomType(type);
  const [seedA, width] = prngIntRange(seed, range[0], range[1]);
  const [seedB, height] = prngIntRange(seedA, range[0], range[1]);

  return [seedB, { width, height }];
};

export const roomsOverlap = (room1: Room, room2: Room): boolean => {
  return (
    room1.x < room2.x + room2.width &&
    room1.x + room1.width > room2.x &&
    room1.y < room2.y + room2.height &&
    room1.y + room1.height > room2.y
  );
};

export const roomsTouch = (room1: Room, room2: Room): boolean => {
  const touchesHorizontally =
    (room1.x + room1.width === room2.x || room2.x + room2.width === room1.x) &&
    !(room1.y + room1.height < room2.y || room2.y + room2.height < room1.y);

  const touchesVertically =
    (room1.y + room1.height === room2.y ||
      room2.y + room2.height === room1.y) &&
    !(room1.x + room1.width < room2.x || room2.x + room2.width < room1.x);

  return touchesHorizontally || touchesVertically;
};

export const getRoomCenter = (room: Room): { x: number; y: number } => {
  return {
    x: room.x + room.width / 2,
    y: room.y + room.height / 2
  };
};

export const getDistanceBetweenRooms = (room1: Room, room2: Room): number => {
  const center1 = getRoomCenter(room1);
  const center2 = getRoomCenter(room2);
  return Math.sqrt(
    Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
  );
};

export const isPointInRoom = (
  point: { x: number; y: number },
  room: Room
): boolean => {
  return (
    point.x >= room.x &&
    point.x <= room.x + room.width &&
    point.y >= room.y &&
    point.y <= room.y + room.height
  );
};

export const generateRoomAround = (
  dungeon: DungeonData,
  targetRoom: Room,
  existingRooms: Room[]
): Room | null => {
  const types = Object.values(RoomType);
  const [seedA, index] = prngIntRange(dungeon.seed, 0, types.length - 1);
  const type = types[index];

  const [seedB, { width, height }] = getRoomSizeForType(type, seedA);

  const allowedEdges = targetRoom.allowedEdges || [
    'NORTH',
    'EAST',
    'SOUTH',
    'WEST'
  ];

  const sides = allowedEdges
    .map(edge => {
      switch (edge) {
        case 'NORTH':
          return 0;
        case 'EAST':
          return 1;
        case 'SOUTH':
          return 2;
        case 'WEST':
          return 3;
        default:
          return -1;
      }
    })
    .filter(side => side !== -1);

  const [seedC, shuffledSides] = prngShuffle(seedB, sides);

  // TODO return the dungeon
  dungeon.seed = seedC;

  for (const side of shuffledSides) {
    let x = 0;
    let y = 0;

    switch (side) {
      case 0: // Top
        x = targetRoom.x;
        y = targetRoom.y - height;
        break;
      case 1: // Right
        x = targetRoom.x + targetRoom.width;
        y = targetRoom.y;
        break;
      case 2: // Bottom
        x = targetRoom.x;
        y = targetRoom.y + targetRoom.height;
        break;
      case 3: // Left
        x = targetRoom.x - width;
        y = targetRoom.y;
        break;
    }

    const newRoom = {
      id: existingRooms.length + 1,
      x,
      y,
      width,
      height,
      type,
      parent: targetRoom,
      depth: (targetRoom.depth || 0) + 1
    };

    let isValid = true;

    if (!roomsTouch(newRoom, targetRoom)) {
      isValid = false;
    }

    for (const room of existingRooms) {
      if (roomsOverlap(newRoom, room)) {
        isValid = false;
        break;
      }
    }

    if (isValid) {
      return newRoom;
    }
  }

  return null;
};
