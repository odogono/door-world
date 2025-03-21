import { useContext } from 'react';
import { DungeonContext } from './context';

export const useDungeon = () => {
  const context = useContext(DungeonContext);
  if (!context) {
    throw new Error('useDungeon must be used within a DungeonProvider');
  }
  return context;
};
