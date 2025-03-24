import { createLog } from '@helpers/log';
import { toTuple, tupleToVector3 } from '@helpers/three';
import { animated, SpringConfig, useSpring } from '@react-spring/three';
import { OrthographicCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Ref, useEffect, useImperativeHandle, useRef } from 'react';
import {
  OrthographicCamera as OrthographicCameraImpl,
  Vector3,
  Vector3Tuple
} from 'three';

const log = createLog('IsometricCamera');

export const ISO_ANGLE = (Math.PI / 180) * 35; //.264;
const DISTANCE = 10;

const SPRING_PRECISION = 0.01;
const SPRING_FRICTION = 14; // 120
const SPRING_TENSION = 60; // 280
const AnimatedOrthographicCamera = animated(OrthographicCamera);

type IsometricCameraProps = {
  initialPosition?: Vector3Tuple;
  initialZoom?: number;
  ref: Ref<IsometricCameraRef>;
};

type AnimationProps = {
  position?: Vector3Tuple;
  zoom?: number;
};

export type IsometricCameraRef = {
  moveTo: (props: {
    config?: SpringConfig;
    position?: Vector3 | Vector3Tuple;
    zoom?: number;
  }) => Promise<void>;
};

export const IsometricCamera = ({
  initialPosition = [0, 0, 0],
  initialZoom = 100,
  ref
}: IsometricCameraProps) => {
  const cameraRef = useRef<OrthographicCameraImpl>(null);
  const isInitial = useRef(true);
  const isAnimating = useRef(false);

  const initialIsometricPosition = calculateIsometricPosition(initialPosition);

  const [springs, api] = useSpring(() => ({
    // config: { friction: 14, tension: 120 },
    config: {
      friction: SPRING_FRICTION,
      // mass: 1,
      precision: SPRING_PRECISION,
      tension: SPRING_TENSION
    },
    onChange: () => {
      isAnimating.current = true;
    },
    onRest: () => {
      isAnimating.current = false;
    },

    position: initialIsometricPosition,
    zoom: initialZoom
  }));

  // zoom has to be handled differently
  useFrame(() => {
    if (cameraRef.current && isAnimating.current) {
      cameraRef.current.zoom = springs.zoom.get();
      cameraRef.current.updateProjectionMatrix();
    }
  });

  useImperativeHandle(ref, () => ({
    moveTo: ({ config = {}, position, zoom }): Promise<void> => {
      return new Promise(resolve => {
        log.debug('Moving to', { position, zoom });
        // moveToResolveRef.current = resolve;

        const animationProps: AnimationProps = {};

        if (position) {
          const isometricPosition = calculateIsometricPosition(position);
          animationProps.position = isometricPosition;
        }

        if (zoom !== undefined) {
          animationProps.zoom = zoom;
        }

        api.start({
          ...animationProps,
          config: {
            // duration: config.duration ?? 1000,
            friction: config.friction ?? SPRING_FRICTION,
            // mass: config.mass ?? 1,
            precision: config.precision ?? SPRING_PRECISION,
            tension: config.tension ?? SPRING_TENSION
          },
          onChange: () => {
            isAnimating.current = true;
          },
          onRest: () => {
            isAnimating.current = false;
            resolve();
            log.debug('Moved to', { position, zoom: springs.zoom.get() });
          }
        });
      });
    }
  }));

  useEffect(() => {
    if (!cameraRef.current) {
      return;
    }

    // Set initial camera position
    if (isInitial.current) {
      cameraRef.current.lookAt(tupleToVector3(initialPosition));
      cameraRef.current.updateProjectionMatrix();
      cameraRef.current.zoom = initialZoom;
      isInitial.current = false;
    }
  }, [initialPosition, initialZoom]);

  return (
    <AnimatedOrthographicCamera
      far={100}
      makeDefault
      near={0.1}
      position={springs.position}
      ref={cameraRef}
      zoom={springs.zoom.get()}
    />
  );
};

const calculateIsometricPosition = (
  targetPosition: Vector3Tuple | Vector3
): Vector3Tuple => {
  // Calculate isometric position relative to target
  // For isometric view, we need equal angles (120 degrees) between all axes
  // We'll use 35.264 degrees (approximately) from the ground plane
  const theta = Math.PI / 4; // 45 degrees rotation around Y axis
  const phi = ISO_ANGLE; // angle from vertical

  // Convert from spherical to Cartesian coordinates
  // const offsetX = DISTANCE * Math.sin(phi) * Math.cos(theta);
  // const offsetY = DISTANCE * Math.cos(phi);
  // const offsetZ = DISTANCE * Math.sin(phi) * Math.sin(theta);

  const offsetX = DISTANCE * Math.cos(phi);
  const offsetY = DISTANCE;
  const offsetZ = DISTANCE * Math.sin(phi);

  // new Vector3(
  //   DISTANCE * Math.cos(ISO_ANGLE),
  //   DISTANCE,
  //   DISTANCE * Math.sin(ISO_ANGLE)
  // );

  const pos = toTuple(targetPosition);

  return [pos[0] + offsetX, pos[1] + offsetY, pos[2] + offsetZ];
};

// // You can also create a utility hook for more complex camera sequences:
// const useCameraSequence = (cameraRef: React.RefObject<CameraControllerHandle>) => {
//   const runSequence = async (
//     sequence: Array<{
//       position?: [number, number, number];
//       rotation?: [number, number, number];
//       zoom?: number;
//       config?: {
//         mass?: number;
//         tension?: number;
//         friction?: number;
//         duration?: number;
//       };
//       delay?: number;
//     }>
//   ) => {
//     for (const step of sequence) {
//       if (step.delay) {
//         await new Promise((resolve) => setTimeout(resolve, step.delay));
//       }
//       await cameraRef.current?.moveTo({
//         position: step.position,
//         rotation: step.rotation,
//         zoom: step.zoom,
//         config: step.config,
//       });
//     }
//   };

//   return { runSequence };
// };

// // Usage example:
// const Scene = () => {
//   const cameraRef = useRef<CameraControllerHandle>(null);
//   const { runSequence } = useCameraSequence(cameraRef);

//   const handleCameraSequence = () => {
//     runSequence([
//       {
//         position: [200, 200, 200],
//         rotation: [-Math.PI / 4, Math.PI / 4, 0],
//         zoom: 30,
//         config: { duration: 1000 },
//       },
//       {
//         delay: 500, // Wait 500ms
//         position: [0, 500, 0],
//         rotation: [-Math.PI / 2, 0, 0],
//         zoom: 40,
//         config: { duration: 1000 },
//       },
//       {
//         position: [0, 0, 500],
//         rotation: [0, 0, 0],
//         zoom: 50,
//         config: { duration: 1000 },
//       },
//     ]);
//   };

//   return (
//     // ... rest of your component
//   );
// };
