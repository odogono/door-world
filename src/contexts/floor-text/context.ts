import { createContext, useContext } from 'react';

export const FloorTextContext = createContext<string | undefined>(undefined);

export const useFloorText = () => useContext(FloorTextContext);
