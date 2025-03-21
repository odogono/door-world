// import './index.css';
import { Door } from '@components/door';
import { GroundText } from '@components/ground-text';
import { IsometricCamera } from '@components/isometric-camera';
import { useDungeon } from '@contexts/dungeon/use-dungeon';
import { createLog } from '@helpers/log';
import { Grid, Plane, Sphere } from '@react-three/drei';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { useState } from 'react';
import { Vector3 } from 'three';
import { MiniMap } from '../world-2d/components/mini-map';

const log = createLog('World3D');

// ClickMarker component to show where the ground was clicked
const ClickMarker = ({ position }: { position: Vector3 }) => {
  return (
    <Sphere args={[0.1, 16, 16]} position={[position.x, 0.1, position.z]}>
      <meshStandardMaterial color="red" />
    </Sphere>
  );
};

// GroundPlane component to handle clicks
const GroundPlane = ({
  onTargetPositionChange
}: {
  onTargetPositionChange: (pos: Vector3) => void;
}) => {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    // Get the intersection point
    const point = event.point;
    const newCameraTarget = new Vector3(point.x, 0, point.z);

    // log.debug('GroundPlane clicked', newCameraTarget);
    onTargetPositionChange(newCameraTarget);
  };

  return (
    <Plane
      args={[100, 100]}
      onClick={handleClick}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false}
    >
      <meshStandardMaterial opacity={0} />
    </Plane>
  );
};

export const World3D = () => {
  const { dungeon } = useDungeon();

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
        <Door position={[0, 0, 4]} />
        <Door doorColor="#00f900" isOpen position={[-4, 0, 0]} rotationY={0} />
        <Door doorColor="#7F42FF" position={[0, 0, -4]} />
        <GroundPlane onTargetPositionChange={handleTargetPositionChange} />
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
