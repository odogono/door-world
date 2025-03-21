import { createLog } from '@helpers/log';
import { applyClippingPlanesToMesh, applyColor, isMesh } from '@helpers/three';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Object3D, Plane as ThreePlane, Vector3, Vector3Tuple } from 'three';

interface DoorProps {
  doorColor?: string;
  frameColor?: string;
  id: string;
  isOpen?: boolean;
  position?: Vector3;
  rotationY?: number;
  scale?: Vector3Tuple;
}

const log = createLog('Door');

const ROTATION_THRESHOLD = 0.01; // Threshold to determine if animation is complete
const POSITION_THRESHOLD = 0.01; // Threshold for position animation
const MOUNT_ANIMATION_SPEED = 8; // Controls how fast the door rises when mounting (higher = faster)

export const Door = ({
  doorColor = '#83D5FF',
  frameColor = '#FFF',
  id,
  isOpen: isOpenProp = false,
  position = new Vector3(0, 0, 0),
  rotationY = -Math.PI / 2,
  scale = [1, 1, 1]
}: DoorProps) => {
  const gltf = useGLTF('/vbasic.door.glb');

  // clone the scene to avoid mutating the original
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

  const localClippingPlane = useMemo(
    () => new ThreePlane(new Vector3(0, 1, 0), 0),
    []
  );

  const isOpen = useRef(isOpenProp);
  const targetRotation = useRef(isOpen.current ? Math.PI / 2 : 0);

  // const [isOpen, setIsOpen] = useState(isOpenProp);
  const doorRef = useRef<Object3D>(null);
  const frameRef = useRef<Object3D>(null);
  // const targetRotation = isOpen.current ? Math.PI / 2 : 0;
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const groupRef = useRef<Object3D>(null);

  useEffect(() => {
    // Find the door and frame nodes and store their references
    const doorNode = scene.getObjectByName('door');
    const frameNode = scene.getObjectByName('door-frame');

    if (!doorNode || !frameNode) {
      log.error('Door or frame node not found');
      return;
    }

    if (doorNode) {
      doorRef.current = doorNode;
      doorRef.current.rotation.y = targetRotation.current;
      applyColor(doorNode, doorColor);
    }

    if (frameNode) {
      frameRef.current = frameNode;
      applyColor(frameNode, frameColor);
    }

    scene.traverse(child => {
      if (isMesh(child)) {
        applyClippingPlanesToMesh(child, [localClippingPlane]);
      }
    });
  }, [scene, frameColor, doorColor, localClippingPlane]);

  useFrame((_state, delta) => {
    if (!doorRef.current || !groupRef.current) {
      return;
    }

    // Handle mounting animation
    if (isEntering) {
      const currentY = groupRef.current.position.y;
      const targetY = 0;
      groupRef.current.position.y +=
        (targetY - currentY) * delta * MOUNT_ANIMATION_SPEED;

      if (
        Math.abs(groupRef.current.position.y - targetY) < POSITION_THRESHOLD
      ) {
        groupRef.current.position.y = targetY;
        setIsEntering(false);
      }
    }

    if (isExiting) {
      const currentY = groupRef.current.position.y;
      const targetY = -1.1;
      groupRef.current.position.y +=
        (targetY - currentY) * delta * MOUNT_ANIMATION_SPEED;

      if (
        Math.abs(groupRef.current.position.y - targetY) < POSITION_THRESHOLD
      ) {
        groupRef.current.position.y = targetY;
        setIsExiting(false);
      }
    }

    // Handle door rotation animation
    if (isAnimating) {
      doorRef.current.rotation.y +=
        (targetRotation.current - doorRef.current.rotation.y) * delta * 2;

      // log.debug('Door rotation', {
      //   current: doorRef.current.rotation.y,
      //   target: targetRotation
      // });
      if (
        Math.abs(doorRef.current.rotation.y - targetRotation.current) <
        ROTATION_THRESHOLD
      ) {
        doorRef.current.rotation.y = targetRotation.current;
        setIsAnimating(false);
      }
    }
  });

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      isOpen.current = !isOpen.current;
      targetRotation.current = isOpen.current ? Math.PI / 2 : 0;
      setIsAnimating(true);
      log.debug('Door clicked', { id, isOpen, targetRotation });
    },
    [isOpen, targetRotation, id]
  );

  // log.debug('Door', {
  //   isAnimating,
  //   isEntering,
  //   isExiting,
  //   isOpen: isOpen.current
  // });

  return (
    <group position={[position.x, -1.1, position.z]} ref={groupRef}>
      <primitive
        object={scene}
        position={[0, 0.5, 0]}
        rotation={[0, rotationY, 0]}
        scale={scale}
      />

      <mesh onClick={handleClick} position={[0, 0.5, 0]} visible={false}>
        <boxGeometry args={[0.8, 1, 0.4]} />
      </mesh>
    </group>
  );
};

// Preload the model
// useGLTF.preload('/vbasic.door.glb');
