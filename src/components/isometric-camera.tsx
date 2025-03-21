import { createLog } from '@helpers/log';
import { OrthographicCamera } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { OrthographicCamera as OrthographicCameraImpl, Vector3 } from 'three';

const log = createLog('IsometricCamera');

export const ISO_ANGLE = (Math.PI / 180) * 35; //.264;
const DISTANCE = 10;
const CAMERA_MOVE_SPEED = 2;

type IsometricCameraProps = {
  targetPosition?: Vector3 | null;
};

// IsometricCamera component to handle the camera setup
export const IsometricCamera = ({ targetPosition }: IsometricCameraProps) => {
  targetPosition = targetPosition ?? new Vector3();
  // const [isAnimating, setIsAnimating] = useState(false);
  // const { camera } = useThree();
  const cameraRef = useRef<OrthographicCameraImpl>(null);
  const initialPosition = useRef<Vector3>(
    new Vector3(
      DISTANCE * Math.cos(ISO_ANGLE),
      DISTANCE,
      DISTANCE * Math.sin(ISO_ANGLE)
    )
  );

  const cameraPosition = useRef<Vector3>(initialPosition.current);

  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    if (!cameraRef.current) {
      return;
    }
    // Set initial camera position
    cameraRef.current.position.copy(initialPosition.current);
    cameraRef.current.lookAt(targetPosition);
    cameraRef.current.updateProjectionMatrix();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cameraRef, targetPosition]);

  useEffect(() => {
    cameraPosition.current = new Vector3(
      targetPosition.x + DISTANCE * Math.cos(ISO_ANGLE),
      DISTANCE,
      targetPosition.z + DISTANCE * Math.sin(ISO_ANGLE)
    );

    // setIsAnimating(true);
    // log.debug('targetPosition', targetPosition);
    // log.debug('cameraPosition', cameraPosition.current);
  }, [targetPosition]);

  // Animation loop for camera movement
  useEffect(() => {
    if (!targetPosition) {
      return;
    }

    const animate = () => {
      if (!cameraRef.current || !targetPosition) {
        return;
      }
      const currentPos = cameraRef.current.position;

      const distance = currentPos.distanceTo(cameraPosition.current);

      // log.debug('distance', distance);

      if (distance > 0.1) {
        // Move camera position
        currentPos.lerp(cameraPosition.current, CAMERA_MOVE_SPEED * 0.016);

        // Ensure camera looks at center
        // cameraRef.current.lookAt(targetPosition);
        cameraRef.current.updateProjectionMatrix();

        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        // setIsAnimating(false);
      }
    };

    animate();
  }, [targetPosition, cameraRef]);

  // return null;
  return (
    <>
      {' '}
      <OrthographicCamera
        far={2000}
        makeDefault
        near={1}
        position={[10, 10, 10]}
        ref={cameraRef}
        zoom={100}
      />
      {/* <OrbitControls
        // enableRotate={true}
        enableZoom={true}
        // enablePan={true}
        minZoom={50}
        maxZoom={300}
        minPolarAngle={ISO_ANGLE}
        maxPolarAngle={ISO_ANGLE}
        enabled={!isAnimating}
      /> */}
    </>
  );
};
