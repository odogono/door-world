import { StrategyType } from '@model/dungeon';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const dungeonSeedAtom = atomWithStorage<number>('dungeonSeed', 1974);

export const dungeonStrategyAtom = atomWithStorage<StrategyType>(
  'dungeonStrategy',
  'random'
);

export const useDungeonSeed = () => {
  const [seed, setSeed] = useAtom(dungeonSeedAtom);

  return {
    seed,
    setSeed
  };
};
