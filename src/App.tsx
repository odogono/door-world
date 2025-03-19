import { Grid, OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import './App.css';
import { Door } from '@components/door';
import { XYZAxis } from '@components/xyz-axis';
import { useEffect } from 'react';

const ISO_ANGLE = (Math.PI / 180) * 35.264;
const DISTANCE = 10;

// IsometricCamera component to handle the camera setup
const IsometricCamera = () => {
  const { camera } = useThree();

  useEffect(() => {
    // Position the camera for isometric view
    // camera.position.set(10, 10, 10);

    camera.position.set(
      DISTANCE * Math.cos(ISO_ANGLE),
      DISTANCE,
      DISTANCE * Math.sin(ISO_ANGLE)
    );

    camera.lookAt(0, 0, 0);

    // Update the camera's projection matrix
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
};

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas gl={{ localClippingEnabled: true }}>
        <OrthographicCamera
          makeDefault
          zoom={150}
          position={[10, 10, 10]}
          near={1}
          far={2000}
        />
        <IsometricCamera />
        <OrbitControls
          enableRotate={true}
          enableZoom={true}
          enablePan={true}
          minZoom={50}
          maxZoom={300}
          // Lock the vertical rotation by setting both angles to Math.PI/4 (45 degrees)
          minPolarAngle={ISO_ANGLE}
          maxPolarAngle={ISO_ANGLE}
          // Optional: Restrict azimuth (horizontal) rotation if needed
          // minAzimuthAngle={-Math.PI / 4} // Limit left rotation
          // maxAzimuthAngle={Math.PI / 4} // Limit right rotation
        />
        <XYZAxis />
        <Door position={[0, -0.5, 0]} />
        <Door position={[2.5, 0, 0]} doorColor="#00f900" />
        <Grid
          infiniteGrid
          sectionSize={1}
          sectionColor="black"
          cellSize={0.1}
        />

        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
      </Canvas>
    </div>
  );
};

export default App;
