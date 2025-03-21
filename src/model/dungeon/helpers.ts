import { randomUnsignedInt } from '../../helpers/random';
import { DungeonData, Room } from './types';

export const getRoomId = (dungeon: DungeonData) => {
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
