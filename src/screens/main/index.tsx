import { World2D } from '@components/world-2d';
import { World3D } from '@components/world-3d';
import { useState } from 'react';

export const MainScreen = () => {
  const [is3DActive, setIs3DActive] = useState(true);

  return (
    <div className="relative flex flex-col items-center gap-4 w-screen h-screen overflow-hidden">
      {is3DActive ? <World3D /> : <World2D />}
    </div>
  );
};
