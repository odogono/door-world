import { randomUnsignedInt } from '../../helpers/random';
import { DungeonData, Room } from './types';

export const getRoomId = (dungeon: DungeonData) => {
  return dungeon.idInc++;
};

export const createDungeon = (
  seed: number = randomUnsignedInt(0, 1000000)
): DungeonData => {
  return {
    idInc: 10,
    rooms: [],
    doors: [],
    seed,
    maxDepth: 0
  };
};

export const getDungeonRoomById = (
  dungeon: DungeonData,
  id: number
): Room | undefined => {
  return dungeon.rooms.find(room => room.id === id);
};
