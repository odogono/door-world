// Dev playground: renders the public <DoorWorld> component, plus the
// internal 2D view as a debug tool for tuning generation strategies.
import './index.css';
import { Provider as JotaiProvider } from 'jotai';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DoorWorld, type Theme } from '../src';
import { World2D } from '../src/components/world-2d';
import { DungeonProvider } from '../src/contexts/dungeon/provider';
import { themeColors, ThemeContext } from '../src/contexts/theme/context';

type View = '2d' | '3d';

const Playground = () => {
  const [view, setView] = useState<View>('3d');
  const [theme, setTheme] = useState<Theme>('light');
  const [floorText, setFloorText] = useState('Door World');

  return (
    <div
      className="playground"
      style={{ background: themeColors[theme].background }}
    >
      {view === '3d' ? (
        <DoorWorld floorText={floorText} theme={theme} />
      ) : (
        <JotaiProvider>
          <ThemeContext value={theme}>
            <DungeonProvider>
              <World2D />
            </DungeonProvider>
          </ThemeContext>
        </JotaiProvider>
      )}
      <div className="toolbar">
        <button onClick={() => setView(view === '3d' ? '2d' : '3d')}>
          view: {view}
        </button>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          theme: {theme}
        </button>
        <input
          onChange={event => setFloorText(event.target.value)}
          value={floorText}
        />
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Playground />
  </StrictMode>
);
