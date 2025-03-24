import { createLog } from '@helpers/log';
import { applyClippingPlanesToObject, applyColor } from '@helpers/three';
import { animated, easings, useSpring } from '@react-spring/three';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import {
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react';
import { Plane as ThreePlane, Vector3, Vector3Tuple } from 'three';

interface DoorProps {
  doorColor?: string;
  frameColor?: string;
  id: string;
  isMounted?: boolean;
  isOpen?: boolean;
  mountDuration?: number;
  onTouch?: (event: ThreeEvent<MouseEvent>) => void;
  openDuration?: number;
  position: Vector3;
  ref: Ref<DoorRef>;
  rotationY?: number;
  scale?: Vector3Tuple;
}

export type DoorRef = {
  close: () => Promise<boolean>;
  // animate into the scene
  mount: () => Promise<boolean>;
  // animate out of the scene
  open: () => Promise<boolean>;
  setOpen: (open: boolean) => Promise<boolean>;
  toggleOpen: () => Promise<boolean>;
  unmount: () => Promise<boolean>;
};

const log = createLog('Door');

export const Door = ({
  doorColor = '#83D5FF',
  frameColor = '#FFF',
  id,
  isMounted: isMountedProp = false,
  isOpen: isOpenProp = false,
  mountDuration = 500,
  onTouch,
  openDuration = 750,
  position = new Vector3(0, 0, 0),
  ref,
  rotationY = -Math.PI / 2,
  scale = [1, 1, 1]
}: DoorProps) => {
  const gltf = useGLTF('/vbasic.door.glb');

  // clone the scene to avoid mutating the original
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  const doorObject = useMemo(() => scene.getObjectByName('door'), [scene]);
  const frameObject = useMemo(
    () => scene.getObjectByName('door-frame'),
    [scene]
  );

  const localClippingPlane = useMemo(
    () => new ThreePlane(new Vector3(0, 1, 0), 0),
    []
  );

  const isOpen = useRef(isOpenProp);
  const isMounted = useRef(isMountedProp);

  const [openDoorSpring, openDoorApi] = useSpring(() => ({
    // config: { duration: 16_000, easing: easings.easeInOutSine },
    // config: { duration: 8000, friction: 14, tension: 120 },
    rotation: [0, isOpen.current ? Math.PI / 2 : 0, 0]
  }));

  const [mountingSpring, mountingApi] = useSpring(() => ({
    position: [position.x, isMounted.current ? 0 : -1.1, position.z]
  }));

  const startTransitionAnimation = useCallback(
    (enter: boolean) => {
      return new Promise<boolean>(resolve => {
        if (isMounted.current === enter) {
          resolve(isMounted.current);
          return;
        }

        const targetY = isMounted.current ? -1.1 : 0;

        // isMounting.current = true;
        mountingApi.start({
          config: { duration: mountDuration, easing: easings.easeInOutSine },
          onRest: () => {
            isMounted.current = enter;
            resolve(isMounted.current);
          },
          position: [position.x, targetY, position.z]
        });
      });
    },
    [mountDuration, position, mountingApi]
  );

  useEffect(() => {
    if (!isMounted.current) {
      startTransitionAnimation(true);
    }
  }, [startTransitionAnimation]);

  const startDoorAnimation = useCallback(
    (open: boolean) => {
      return new Promise<boolean>(resolve => {
        if (isOpen.current === open) {
          resolve(isOpen.current);
          return;
        }

        const targetRotation = isOpen.current ? 0 : Math.PI / 2;

        openDoorApi.start({
          config: { duration: openDuration, easing: easings.easeInOutSine },
          onRest: () => {
            isOpen.current = open;
            resolve(isOpen.current);
          },
          rotation: [0, targetRotation, 0]
        });
      });
    },
    [openDuration, openDoorApi]
  );

  useImperativeHandle(ref, () => ({
    close: () => startDoorAnimation(false),
    mount: () => startTransitionAnimation(true),
    open: () => startDoorAnimation(true),
    setOpen: (isOpen: boolean) => startDoorAnimation(isOpen),
    toggleOpen: () => startDoorAnimation(!isOpen.current),
    unmount: () => startTransitionAnimation(false)
  }));

  useEffect(() => {
    if (!doorObject || !frameObject) {
      log.debug('Door or frame node not found');
      return;
    }

    applyColor(doorObject, doorColor);

    applyColor(frameObject, frameColor);

    applyClippingPlanesToObject(frameObject, [localClippingPlane]);
    applyClippingPlanesToObject(doorObject, [localClippingPlane]);
  }, [
    scene,
    frameColor,
    doorColor,
    localClippingPlane,
    doorObject,
    frameObject
  ]);

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      onTouch?.(event);
    },
    [onTouch]
  );

  log.debug('door', id, { isOpenProp });
  return (
    <animated.group position={mountingSpring.position}>
      <group position={[0, 0.5, 0]} rotation={[0, rotationY, 0]} scale={scale}>
        {frameObject && <primitive dispose={null} object={frameObject} />}
        {doorObject && (
          <animated.primitive
            dispose={null}
            object={doorObject}
            rotation={openDoorSpring.rotation}
          />
        )}
      </group>
      <mesh onClick={handleClick} position={[0, 0.5, 0]} visible={false}>
        <boxGeometry args={[0.8, 1, 0.4]} />
      </mesh>
    </animated.group>
  );
};

// Preload the model
// useGLTF.preload('/vbasic.door.glb');
