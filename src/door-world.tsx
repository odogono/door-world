import { Provider as JotaiProvider } from 'jotai';
import type { CSSProperties } from 'react';
import { World3D } from './components/world-3d';
import { DungeonProvider } from './contexts/dungeon/provider';
import { FloorTextContext } from './contexts/floor-text/context';
import { ThemeContext } from './contexts/theme/context';
import type { Theme } from './contexts/theme/types';

export interface DoorWorldProps {
  className?: string;
  /** Words written on the floor of the starting room */
  floorText?: string;
  style?: CSSProperties;
  theme?: Theme;
}

const containerStyle: CSSProperties = {
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  width: '100%'
};

export const DoorWorld = ({
  className,
  floorText,
  style,
  theme = 'light'
}: DoorWorldProps) => (
  <JotaiProvider>
    <ThemeContext value={theme}>
      <FloorTextContext value={floorText}>
        <DungeonProvider>
          <div className={className} style={{ ...containerStyle, ...style }}>
            <World3D showMiniMap={false} />
          </div>
        </DungeonProvider>
      </FloorTextContext>
    </ThemeContext>
  </JotaiProvider>
);
