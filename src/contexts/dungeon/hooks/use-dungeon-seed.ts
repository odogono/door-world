import { useAtom } from 'jotai';
import { seedAtom } from '../atoms';

export const useDungeonSeed = () => {
  const [seed, setSeed] = useAtom(seedAtom);

  return {
    seed,
    setSeed
  };
};
