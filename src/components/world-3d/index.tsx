// import './index.css';
import { GroundText } from '@components/world-3d/components/ground-text';
import { IsometricCamera } from '@components/world-3d/components/isometric-camera';
import { useDungeon } from '@contexts/dungeon/use-dungeon';
import { createLog } from '@helpers/log';
import { Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { Vector3 } from 'three';
import { useDungeonCurrentRoom } from '../../contexts/dungeon/atoms';
import { MiniMap } from '../world-2d/components/mini-map';
import { ClickMarker, ClickPlane } from './components/click-plane';
import { Dungeon } from './components/dungeon';

const log = createLog('World3D');

export const World3D = () => {
  const { dungeon } = useDungeon();
  const { currentRoom } = useDungeonCurrentRoom();

  const [targetPosition, setTargetPosition] = useState<Vector3 | null>(null);
  const [clickedPosition, setClickedPosition] = useState<Vector3 | null>(null);

  const handleTargetPositionChange = (pos: Vector3) => {
    setTargetPosition(pos);
    setClickedPosition(pos);
  };

  return (
    <div className="w-full h-full">
      <Canvas gl={{ localClippingEnabled: true }}>
        <IsometricCamera targetPosition={targetPosition} />

        {/* <XYZAxis /> */}
        <Dungeon currentRoom={currentRoom} dungeon={dungeon} />
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
