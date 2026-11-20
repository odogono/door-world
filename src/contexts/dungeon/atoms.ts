import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  type DoorId,
  type DungeonData,
  type RoomId,
  type StrategyType
} from '../../model/dungeon';

export const dungeonAtom = atomWithStorage<DungeonData | null>('dungeon', null);

export const seedAtom = atomWithStorage<number>('dungeonSeed', 1974);

export const dungeonStrategyAtom = atomWithStorage<StrategyType>(
  'dungeonStrategy',
  'random'
);

// Not saved: every visit starts a new Journey in the first Room
export const currentRoomAtom = atom<RoomId>(1);

export const visibleRoomsAtom = atom<RoomId[]>([]);
export const visibleDoorsAtom = atom<DoorId[]>([]);

export const visitedRoomsAtom = atom<RoomId[]>([]);

export const roomHistoryAtom = atom<RoomId[]>([]);

export const nextRoomAtom = atom<RoomId | null>(null);
export const nextDoorAtom = atom<DoorId | null>(null);
