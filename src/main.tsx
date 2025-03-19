import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { World2D } from './components/world-2d';
import { World3D } from './components/world-3d';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <World3D /> */}
    <World2D />
  </StrictMode>
);
