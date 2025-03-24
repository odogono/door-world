import { useAtom } from 'jotai';
import { dungeonAtom } from '../atoms';

export const useDungeonAtom = () => {
  const [dungeon, setDungeon] = useAtom(dungeonAtom);

  return {
    dungeon,
    setDungeon
  };
};
