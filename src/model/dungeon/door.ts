import { createLog } from '@helpers/log';
import { DOOR_HEIGHT, DOOR_WIDTH } from './constants';
import { roomsTouch } from './room';
import { CompassDirection, Door, Room } from './types';

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

  let touchingEdge: CompassDirection | null = null;

  if (otherRoom.area.y + otherRoom.area.height === targetRoom.area.y) {
    touchingEdge = 'NORTH';
  } else if (targetRoom.area.y + targetRoom.area.height === otherRoom.area.y) {
    touchingEdge = 'SOUTH';
  } else if (otherRoom.area.x + otherRoom.area.width === targetRoom.area.x) {
    touchingEdge = 'WEST';
  } else if (targetRoom.area.x + targetRoom.area.width === otherRoom.area.x) {
    touchingEdge = 'EAST';
  }

  if (!touchingEdge || !allowedEdges.includes(touchingEdge)) {
    return null;
  }

  let xOverlap: number;
  let yOverlap: number;

  if (touchingEdge === 'NORTH' || touchingEdge === 'SOUTH') {
    xOverlap =
      Math.min(
        targetRoom.area.x + targetRoom.area.width,
        otherRoom.area.x + otherRoom.area.width
      ) - Math.max(targetRoom.area.x, otherRoom.area.x);

    if (xOverlap >= DOOR_WIDTH) {
      const x =
        Math.max(targetRoom.area.x, otherRoom.area.x) +
        (xOverlap - DOOR_WIDTH) / 2;
      const y =
        touchingEdge === 'NORTH'
          ? targetRoom.area.y - DOOR_HEIGHT / 2
          : targetRoom.area.y + targetRoom.area.height - DOOR_HEIGHT / 2;
      return { x, y };
    }
  } else {
    yOverlap =
      Math.min(
        targetRoom.area.y + targetRoom.area.height,
        otherRoom.area.y + otherRoom.area.height
      ) - Math.max(targetRoom.area.y, otherRoom.area.y);

    if (yOverlap >= DOOR_HEIGHT) {
      const y =
        Math.max(targetRoom.area.y, otherRoom.area.y) +
        (yOverlap - DOOR_HEIGHT) / 2;
      const x =
        touchingEdge === 'WEST'
          ? targetRoom.area.x - DOOR_WIDTH / 2
          : targetRoom.area.x + targetRoom.area.width - DOOR_WIDTH / 2;
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
          doors.push({
            position,
            room1: rooms[i].id,
            room2: rooms[j].id
          });
        }
      }
    }
  }

  return doors;
};
