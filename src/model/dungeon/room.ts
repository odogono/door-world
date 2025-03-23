import { isNumber } from '@helpers/number';
import { prngIntRange, prngShuffle } from '@helpers/random';
import {
  ROOM_SIZE_LARGE,
  ROOM_SIZE_MEDIUM,
  ROOM_SIZE_SMALL
} from './constants';
import { generateRoomId, getDungeonRoomById } from './helpers';
import { DungeonData, Position, Room, RoomId, RoomType } from './types';

export const getMaxRoomDepth = (rooms: Room[]): number => {
  if (rooms.length === 0) {
    return 0;
  }
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
): [number, { height: number; width: number }] => {
  const range = getRangeForRoomType(type);
  const [seedA, width] = prngIntRange(seed, range[0], range[1]);
  const [seedB, height] = prngIntRange(seedA, range[0], range[1]);

  return [seedB, { height, width }];
};

export const roomsOverlap = (room1: Room, room2: Room): boolean => {
  const { area: area1 } = room1;
  const { area: area2 } = room2;

  return (
    area1.x < area2.x + area2.width &&
    area1.x + area1.width > area2.x &&
    area1.y < area2.y + area2.height &&
    area1.y + area1.height > area2.y
  );
};

export const roomsTouch = (room1: Room, room2: Room): boolean => {
  const { area: area1 } = room1;
  const { area: area2 } = room2;
  const touchesHorizontally =
    (area1.x + area1.width === area2.x || area2.x + area2.width === area1.x) &&
    !(area1.y + area1.height < area2.y || area2.y + area2.height < area1.y);
  if (touchesHorizontally) {
    return true;
  }

  const touchesVertically =
    (area1.y + area1.height === area2.y ||
      area2.y + area2.height === area1.y) &&
    !(area1.x + area1.width < area2.x || area2.x + area2.width < area1.x);

  return touchesVertically;
};

export const getRoomCenter = (
  dungeon: DungeonData,
  room: Room | RoomId
): Position => {
  const target = isNumber(room) ? getDungeonRoomById(dungeon, room) : room;

  if (!target) {
    throw new Error(`Room ${room} not found`);
  }

  return {
    x: target.area.x + target.area.width / 2,
    y: target.area.y + target.area.height / 2
  };
};

export const getDistanceBetweenRooms = (
  dungeon: DungeonData,
  room1: Room | RoomId,
  room2: Room | RoomId
): number => {
  const center1 = getRoomCenter(dungeon, room1);
  const center2 = getRoomCenter(dungeon, room2);
  return Math.sqrt(
    Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
  );
};

export const isPointInRoom = (
  point: { x: number; y: number },
  room: Room
): boolean => {
  return (
    point.x >= room.area.x &&
    point.x <= room.area.x + room.area.width &&
    point.y >= room.area.y &&
    point.y <= room.area.y + room.area.height
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

  const [seedB, { height, width }] = getRoomSizeForType(type, seedA);

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
        x = targetRoom.area.x;
        y = targetRoom.area.y - height;
        break;
      case 1: // Right
        x = targetRoom.area.x + targetRoom.area.width;
        y = targetRoom.area.y;
        break;
      case 2: // Bottom
        x = targetRoom.area.x;
        y = targetRoom.area.y + targetRoom.area.height;
        break;
      case 3: // Left
        x = targetRoom.area.x - width;
        y = targetRoom.area.y;
        break;
    }

    const newRoom = {
      area: { height, width, x, y },
      depth: (targetRoom.depth || 0) + 1,
      id: 0,
      parent: targetRoom,
      type
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
      return {
        ...newRoom,
        id: generateRoomId(dungeon)
      };
    }
  }

  return null;
};
