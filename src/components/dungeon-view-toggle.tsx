import { useDungeonView } from '@contexts/dungeon-view/context';
import { useTheme } from '@contexts/theme/context';
import { createPortal } from 'react-dom';

export const DungeonViewToggle = () => {
  const { dungeonView, toggleDungeonView } = useDungeonView();
  const { theme } = useTheme();

  const Button = () => {
    return (
      <button
        aria-label={`Switch to ${dungeonView === '2d' ? '3d' : '2d'} view`}
        className="fixed top-4 left-4 p-2 rounded-full 
          bg-gray-900 dark:bg-opacity-20 dark:backdrop-blur-sm
          hover:bg-gray-700 dark:hover:bg-opacity-30 
          transition-colors
          dark:text-white text-black"
        onClick={toggleDungeonView}
      >
        {dungeonView === '2d' ? (
          // 3D cube icon for 2D mode
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
            />
          </svg>
        ) : (
          // 2D square icon for 3D mode
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              height="14"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              width="14"
              x="5"
              y="5"
            />
          </svg>
        )}
      </button>
    );
  };

  return <div>{createPortal(<Button />, document.body)}</div>;
};
