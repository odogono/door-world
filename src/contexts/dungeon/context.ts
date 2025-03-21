import { createContext } from 'react';
import { DungeonContextType } from './types';

export const DungeonContext = createContext<DungeonContextType | null>(null);
