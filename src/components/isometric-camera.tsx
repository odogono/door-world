import { createLog } from '@helpers/log';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { OrthographicCamera as OrthographicCameraImpl, Vector3 } from 'three';

const log = createLog('IsometricCamera');

export const ISO_ANGLE = (Math.PI / 180) * 35; //.264;
const DISTANCE = 10;
const CAMERA_MOVE_SPEED = 2;

type IsometricCameraProps = {
  targetPosition?: Vector3 | null;
};

const calculateIsometricPosition = (targetPosition: Vector3) => {
  // Calculate isometric position relative to target
  // For isometric view, we need equal angles (120 degrees) between all axes
  // We'll use 35.264 degrees (approximately) from the ground plane
  const theta = Math.PI / 4; // 45 degrees rotation around Y axis
  const phi = ISO_ANGLE; // angle from vertical

  // Convert from spherical to Cartesian coordinates
  const offsetX = DISTANCE * Math.sin(phi) * Math.cos(theta);
  const offsetY = DISTANCE * Math.cos(phi);
  const offsetZ = DISTANCE * Math.sin(phi) * Math.sin(theta);

  // const offsetX = DISTANCE * Math.cos(phi);
  // const offsetY = DISTANCE;
  // const offsetZ = DISTANCE * Math.sin(phi);

  // new Vector3(
  //   DISTANCE * Math.cos(ISO_ANGLE),
  //   DISTANCE,
  //   DISTANCE * Math.sin(ISO_ANGLE)
  // );

  return new Vector3(
    targetPosition.x + offsetX,
    targetPosition.y + offsetY,
    targetPosition.z + offsetZ
  );
};

// IsometricCamera component to handle the camera setup
export const IsometricCamera = ({ targetPosition }: IsometricCameraProps) => {
  targetPosition = targetPosition ?? new Vector3();
  // const [isAnimating, setIsAnimating] = useState(false);
  // const { camera } = useThree();
  const cameraRef = useRef<OrthographicCameraImpl>(null);
  const controlsRef = useRef<typeof OrbitControls>(null);
  const animationFrameId = useRef<number>(0);
  const isInitial = useRef(true);

  const cameraTargetPosition = useRef<Vector3>(new Vector3());

  useEffect(() => {
    if (!cameraRef.current) {
      return;
    }

    const isometricPosition = calculateIsometricPosition(targetPosition);

    // Set initial camera position
    if (isInitial.current) {
      cameraRef.current.position.copy(isometricPosition);
      cameraTargetPosition.current.copy(isometricPosition);
      cameraRef.current.lookAt(targetPosition);
      cameraRef.current.updateProjectionMatrix();
      isInitial.current = false;
    } else {
      // set the animation targets
      cameraTargetPosition.current.copy(isometricPosition);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cameraRef, targetPosition]);

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
      const distance = currentPos.distanceTo(cameraTargetPosition.current);

      if (distance > 0.1) {
        // Move camera position
        currentPos.lerp(
          cameraTargetPosition.current,
          CAMERA_MOVE_SPEED * 0.016
        );

        // Ensure camera looks at target after each movement
        // cameraRef.current.lookAt(targetPosition);

        // Ensure up vector is properly aligned for isometric view
        cameraRef.current.up.set(0, 1, 0);

        cameraRef.current.updateProjectionMatrix();

        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        // animationFrameId.current = 0;
        // setIsAnimating(false);
      }
    };

    animate();
  }, [targetPosition, cameraRef]);

  return (
    // <>
    <OrthographicCamera
      far={2000}
      makeDefault
      near={1}
      position={[10, 10, 10]}
      ref={cameraRef}
      zoom={100}
    />
  );
};
