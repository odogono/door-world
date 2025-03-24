import {
  type Door,
  type DungeonData,
  type Room,
  type RoomId,
  type StrategyType
} from '@model/dungeon';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const dungeonAtom = atomWithStorage<DungeonData | null>('dungeon', null);

export const dungeonSeedAtom = atomWithStorage<number>('dungeonSeed', 1974);

export const dungeonStrategyAtom = atomWithStorage<StrategyType>(
  'dungeonStrategy',
  'random'
);

export const dungeonCurrentRoomAtom = atomWithStorage<RoomId>('dungeonRoom', 1);

export const dungeonVisibleRoomsAtom = atom<Room[]>([]);
export const dungeonVisibleDoorsAtom = atom<Door[]>([]);
