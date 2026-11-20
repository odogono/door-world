import { createContext, useContext } from 'react';
import type { Theme } from './types';

export const ThemeContext = createContext<Theme>('light');

// Colours that previously came from the host page's CSS variables
export const themeColors: Record<
  Theme,
  { background: string; foreground: string }
> = {
  dark: { background: '#0a0a0a', foreground: '#fafafa' },
  light: { background: '#eeeeee', foreground: '#0a0a0a' }
};

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  return { colors: themeColors[theme], theme } as const;
};
