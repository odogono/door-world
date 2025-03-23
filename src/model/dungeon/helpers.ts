import { randomUnsignedInt } from '@helpers/random';
import { Door, DungeonData, Room } from './types';

export const generateRoomId = (dungeon: DungeonData) => {
  return dungeon.idInc++;
};

export const createDungeon = (
  seed: number = randomUnsignedInt(0, 1_000_000)
): DungeonData => {
  return {
    doors: [],
    idInc: 10,
    maxDepth: 0,
    rooms: [],
    seed
  };
};

export const getDungeonRoomById = (
  dungeon?: DungeonData | null,
  id?: number
): Room | undefined => {
  if (!dungeon || !id) {
    return undefined;
  }

  return dungeon.rooms.find(room => room.id === id);
};

export const getDungeonDoorById = (
  dungeon?: DungeonData | null,
  id?: string
): Door | undefined => {
  if (!dungeon || !id) {
    return undefined;
  }

  return dungeon.doors.find(door => door.id === id);
};
