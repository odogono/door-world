import { createContext } from 'react';
import type { DungeonContextType } from './types';

export const DungeonContext = createContext<DungeonContextType | null>(null);
