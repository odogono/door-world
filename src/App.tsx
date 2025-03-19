import { Grid, OrbitControls, Plane, Sphere, Text } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import './App.css';
import { Door } from '@components/door';
import { ISO_ANGLE, IsometricCamera } from '@components/isometric-camera';
import { createLog } from '@helpers/log';
import { Suspense, useState } from 'react';
import { Vector3 } from 'three';
import { GroundText } from './components/ground-text';

const log = createLog('App');

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
  const handleClick = (event: any) => {
    event.stopPropagation();

    // Get the intersection point
    const point = event.point;
    const newCameraTarget = new Vector3(point.x, 0, point.z);

    log.debug('GroundPlane clicked', newCameraTarget);
    onTargetPositionChange(newCameraTarget);
  };

  return (
    <Plane
      args={[100, 100]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
      visible={false}
    >
      <meshStandardMaterial transparent opacity={0} />
    </Plane>
  );
};

const App = () => {
  const [targetPosition, setTargetPosition] = useState<Vector3 | null>(null);
  const [clickedPosition, setClickedPosition] = useState<Vector3 | null>(null);

  const handleTargetPositionChange = (pos: Vector3) => {
    setTargetPosition(pos);
    setClickedPosition(pos);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas gl={{ localClippingEnabled: true }}>
        <IsometricCamera targetPosition={targetPosition} />

        {/* <XYZAxis /> */}
        <Door position={[0, 0, 4]} />
        <Door position={[-4, 0, 0]} rotationY={0} doorColor="#00f900" isOpen />
        <Door position={[0, 0, -4]} doorColor="#7F42FF" />
        <GroundPlane onTargetPositionChange={handleTargetPositionChange} />
        {clickedPosition && (
          <>
            <ClickMarker position={clickedPosition} />
            <GroundText
              position={clickedPosition}
              text="Clicked here!"
              onEnterSpeed={0.01}
            />
          </>
        )}
        <Grid
          infiniteGrid
          sectionSize={1}
          sectionColor="black"
          cellSize={0.1}
        />

        <GroundText position={[0, 0, 0]} text="Open Door Go North" />

        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
      </Canvas>
    </div>
  );
};

export default App;
