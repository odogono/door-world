import { useAtom } from 'jotai';
import { dungeonSeedAtom } from '../atoms';

export const useDungeonSeed = () => {
  const [seed, setSeed] = useAtom(dungeonSeedAtom);

  return {
    seed,
    setSeed
  };
};
