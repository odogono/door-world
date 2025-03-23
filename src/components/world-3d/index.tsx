// import './index.css';
import { GroundText } from '@components/world-3d/components/ground-text';
import {
  IsometricCamera,
  IsometricCameraRef
} from '@components/world-3d/components/isometric-camera';
import { useDungeonCurrentRoom } from '@contexts/dungeon/atoms';
import { useDungeon } from '@contexts/dungeon/use-dungeon';
import { createLog } from '@helpers/log';
import { vector3ToTuple } from '@helpers/three';
import { Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Vector3 } from 'three';
import { MiniMap } from '../world-2d/components/mini-map';
import { ClickMarker, ClickPlane } from './components/click-plane';
import { Dungeon } from './components/dungeon';

const log = createLog('World3D');

export const World3D = () => {
  const cameraRef = useRef<IsometricCameraRef>(null);
  const { dungeon } = useDungeon();
  const { currentRoom } = useDungeonCurrentRoom();

  // const [targetPosition, setTargetPosition] = useState<Vector3 | null>(null);
  const [clickedPosition, setClickedPosition] = useState<Vector3 | null>(null);

  const handleTargetPositionChange = async (pos: Vector3) => {
    // setTargetPosition(pos);
    setClickedPosition(pos);
    await cameraRef.current?.moveTo({
      position: vector3ToTuple(pos)
      // zoom: 200
    });
    log.debug('Moved to', pos);
  };

  return (
    <div className="w-full h-full">
      <Canvas gl={{ localClippingEnabled: true }}>
        <IsometricCamera
          initialPosition={[0, 0, -2]}
          initialZoom={100}
          ref={cameraRef}
        />

        {/* <XYZAxis /> */}
        <Dungeon />
        {/* <Door position={[0, 0, 4]} /> */}
        {/* <Door doorColor="#00f900" isOpen position={[-4, 0, 0]} rotationY={0} /> */}
        {/* <Door doorColor="#7F42FF" position={[0, 0, -4]} /> */}
        <ClickPlane onTargetPositionChange={handleTargetPositionChange} />
        {clickedPosition && (
          <>
            <ClickMarker position={clickedPosition} />
            <GroundText
              onEnterSpeed={0.01}
              position={clickedPosition}
              text="Clicked here!"
            />
          </>
        )}
        <Grid
          cellSize={0.1}
          infiniteGrid
          renderOrder={3}
          sectionColor="black"
          sectionSize={1}
        />

        <GroundText position={[0, 0, 0]} text="Open Door Go North" />

        <ambientLight intensity={0.1} />
        <directionalLight intensity={2} position={[10, 10, 5]} />
      </Canvas>
      <MiniMap dungeon={dungeon} />
    </div>
  );
};
