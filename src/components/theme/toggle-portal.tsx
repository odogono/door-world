import { createPortal } from 'react-dom';
import { ThemeToggle } from './toggle-button';

export const ThemeTogglePortal = () => {
  return <div>{createPortal(<ThemeToggle />, document.body)}</div>;
};
