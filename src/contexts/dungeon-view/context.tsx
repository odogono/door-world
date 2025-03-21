import { createContext, useContext } from 'react';
import { DungeonViewContextType } from './types';

export const DungeonViewContext = createContext<
  DungeonViewContextType | undefined
>(undefined);

export function useDungeonView() {
  const context = useContext(DungeonViewContext);
  if (context === undefined) {
    throw new Error('useDungeonView must be used within a DungeonViewProvider');
  }
  return context;
}
