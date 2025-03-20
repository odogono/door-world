import { createLog } from '@helpers/log';
import { DOOR_HEIGHT, DOOR_WIDTH } from './constants';
import { roomsTouch } from './room';
import { Door, Room } from './types';

const log = createLog('Dungeon.Door');

export const findDoorPosition = (
  room1: Room,
  room2: Room
): { x: number; y: number } | null => {
  const targetRoom = room1.allowedEdges ? room1 : room2;
  const otherRoom = room1.allowedEdges ? room2 : room1;

  const allowedEdges = targetRoom.allowedEdges || [
    'NORTH',
    'EAST',
    'SOUTH',
    'WEST'
  ];

  let touchingEdge: 'NORTH' | 'EAST' | 'SOUTH' | 'WEST' | null = null;

  if (otherRoom.y + otherRoom.height === targetRoom.y) {
    touchingEdge = 'NORTH';
  } else if (targetRoom.y + targetRoom.height === otherRoom.y) {
    touchingEdge = 'SOUTH';
  } else if (otherRoom.x + otherRoom.width === targetRoom.x) {
    touchingEdge = 'WEST';
  } else if (targetRoom.x + targetRoom.width === otherRoom.x) {
    touchingEdge = 'EAST';
  }

  if (!touchingEdge || !allowedEdges.includes(touchingEdge)) {
    return null;
  }

  let xOverlap: number;
  let yOverlap: number;

  if (touchingEdge === 'NORTH' || touchingEdge === 'SOUTH') {
    xOverlap =
      Math.min(targetRoom.x + targetRoom.width, otherRoom.x + otherRoom.width) -
      Math.max(targetRoom.x, otherRoom.x);

    if (xOverlap >= DOOR_WIDTH) {
      const x =
        Math.max(targetRoom.x, otherRoom.x) + (xOverlap - DOOR_WIDTH) / 2;
      const y =
        touchingEdge === 'NORTH'
          ? targetRoom.y - DOOR_HEIGHT / 2
          : targetRoom.y + targetRoom.height - DOOR_HEIGHT / 2;
      return { x, y };
    }
  } else {
    yOverlap =
      Math.min(
        targetRoom.y + targetRoom.height,
        otherRoom.y + otherRoom.height
      ) - Math.max(targetRoom.y, otherRoom.y);

    if (yOverlap >= DOOR_HEIGHT) {
      const y =
        Math.max(targetRoom.y, otherRoom.y) + (yOverlap - DOOR_HEIGHT) / 2;
      const x =
        touchingEdge === 'WEST'
          ? targetRoom.x - DOOR_WIDTH / 2
          : targetRoom.x + targetRoom.width - DOOR_WIDTH / 2;
      return { x, y };
    }
  }

  return null;
};

export const findDoors = (rooms: Room[]): Door[] => {
  const doors: Door[] = [];

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      if (roomsTouch(rooms[i], rooms[j])) {
        const position = findDoorPosition(rooms[i], rooms[j]);
        if (position) {
          log.debug('Found door', {
            room1: rooms[i].id,
            room2: rooms[j].id,
            position
          });
          doors.push({
            room1: rooms[i],
            room2: rooms[j],
            position,
            width: DOOR_WIDTH,
            height: DOOR_HEIGHT
          });
        }
      }
    }
  }

  return doors;
};
