import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { DungeonProvider } from '@contexts/dungeon/provider';
import { World3D } from './components/world-3d';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DungeonProvider>
      <World3D />
      {/* <World2D /> */}
    </DungeonProvider>
  </StrictMode>
);
