import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { DungeonProvider } from '@contexts/dungeon/provider';
import { ThemeProvider } from '@contexts/theme/provider';
import { MainScreen } from '@screens/main';
import { DungeonViewProvider } from './contexts/dungeon-view/provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DungeonViewProvider>
        <DungeonProvider>
          <MainScreen />
        </DungeonProvider>
      </DungeonViewProvider>
    </ThemeProvider>
  </StrictMode>
);
