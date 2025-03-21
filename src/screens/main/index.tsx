import { DungeonViewToggle } from '@components/dungeon-view-toggle';
import { ThemeTogglePortal } from '@components/theme/toggle-portal';
import { World2D } from '@components/world-2d';
import { World3D } from '@components/world-3d';
import { useDungeonView } from '@contexts/dungeon-view/context';

export const MainScreen = () => {
  const { dungeonView } = useDungeonView();

  return (
    <>
      <div className="relative flex flex-col items-center gap-4 w-screen h-screen overflow-hidden">
        {dungeonView === '3d' ? <World3D /> : <World2D />}
      </div>
      <ThemeTogglePortal />
      <DungeonViewToggle />
    </>
  );
};
