import { ReactNode, useCallback, useEffect, useState } from 'react';
import { DungeonViewContext } from './context';
import { DungeonViewMode } from './types';

interface DungeonViewProviderProps {
  children: ReactNode;
}

export function DungeonViewProvider({ children }: DungeonViewProviderProps) {
  const [dungeonView, setDungeonView] = useState<DungeonViewMode>(() => {
    // Check if theme was previously saved
    const savedView = localStorage.getItem('view');

    return savedView as DungeonViewMode;
  });

  useEffect(() => {
    // Update document class when theme changes
    document.documentElement.classList.remove('2d', '3d');
    document.documentElement.classList.add(dungeonView);
    localStorage.setItem('view', dungeonView);
  }, [dungeonView]);

  const toggleDungeonView = useCallback(() => {
    setDungeonView(prevView => (prevView === '2d' ? '3d' : '2d'));
  }, []);

  return (
    <DungeonViewContext.Provider value={{ dungeonView, toggleDungeonView }}>
      {children}
    </DungeonViewContext.Provider>
  );
}
