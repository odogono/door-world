import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ThemeTogglePortal } from '@components/theme/toggle-portal';
import { DungeonProvider } from '@contexts/dungeon/provider';
import { ThemeProvider } from '@contexts/theme/provider';
import { MainScreen } from '@screens/main';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DungeonProvider>
        <ThemeTogglePortal />
        <MainScreen />
      </DungeonProvider>
    </ThemeProvider>
  </StrictMode>
);
