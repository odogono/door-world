// import './index.css';
import {
  IsometricCamera,
  IsometricCameraMoveToProps,
  IsometricCameraRef
} from '@components/world-3d/components/isometric-camera';
import { useDungeon } from '@contexts/dungeon/use-dungeon';
import { createLog } from '@helpers/log';
import { Canvas } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import { MiniMap } from '../world-2d/components/mini-map';
import { Dungeon } from './components/dungeon';

const log = createLog('World3D');

export const World3D = () => {
  const cameraRef = useRef<IsometricCameraRef>(null);

  const handleMoveCameraTo = useCallback(
    async (props: IsometricCameraMoveToProps) => {
      await cameraRef.current?.moveTo(props);
    },
    []
  );

  return (
    <div className="w-full h-full">
      <Canvas gl={{ localClippingEnabled: true }}>
        <IsometricCamera
          initialPosition={[0, 0, -2]}
          initialZoom={100}
          ref={cameraRef}
        />

        {/* <XYZAxis /> */}
        <Dungeon moveCameraTo={handleMoveCameraTo} />

        {/* <Grid
          cellSize={0.1}
          infiniteGrid
          renderOrder={3}
          sectionColor="black"
          sectionSize={1}
        /> */}

        <ambientLight intensity={0.1} />
        <directionalLight intensity={2} position={[10, 10, 5]} />
      </Canvas>
      <DungeonMiniMap />
    </div>
  );
};

const DungeonMiniMap = () => {
  const { dungeon } = useDungeon();

  return <MiniMap dungeon={dungeon} />;
};
