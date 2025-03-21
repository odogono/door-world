import type { DungeonData, RoomId, StrategyType } from '@model/dungeon';
import { getDungeonRoomById } from '@model/dungeon/helpers';
import { useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const dungeonAtom = atomWithStorage<DungeonData | null>('dungeon', null);

export const dungeonSeedAtom = atomWithStorage<number>('dungeonSeed', 1974);

export const dungeonStrategyAtom = atomWithStorage<StrategyType>(
  'dungeonStrategy',
  'random'
);

export const dungeonCurrentRoomAtom = atomWithStorage<RoomId>('dungeonRoom', 1);

export const useDungeonSeed = () => {
  const [seed, setSeed] = useAtom(dungeonSeedAtom);

  return {
    seed,
    setSeed
  };
};

export const useDungeonCurrentRoom = () => {
  const dungeon = useAtomValue(dungeonAtom);
  const [roomId, setRoomId] = useAtom(dungeonCurrentRoomAtom);

  const currentRoom = getDungeonRoomById(dungeon, roomId);

  return {
    currentRoom,
    roomId,
    setRoomId
  };
};

export const useDungeonAtom = () => {
  const [dungeon, setDungeon] = useAtom(dungeonAtom);

  return {
    dungeon,
    setDungeon
  };
};
