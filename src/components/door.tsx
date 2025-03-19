import { createLog } from '@helpers/log';
import { Plane, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Mesh, Object3D, Plane as ThreePlane, Vector3 } from 'three';
import { applyColor } from '../helpers/object-3d';

interface DoorProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotationY?: number;
  frameColor?: string;
  doorColor?: string;
}

const log = createLog('Door');

const ROTATION_THRESHOLD = 0.01; // Threshold to determine if animation is complete
const POSITION_THRESHOLD = 0.01; // Threshold for position animation
const MOUNT_ANIMATION_SPEED = 8; // Controls how fast the door rises when mounting (higher = faster)

export const Door = ({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotationY = -Math.PI / 2,
  doorColor = '#83D5FF',
  frameColor = '#FFF'
}: DoorProps) => {
  const gltf = useGLTF('/vbasic.door.glb');

  // clone the scene to avoid mutating the original
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

  const localClippingPlane = useMemo(
    () => new ThreePlane(new Vector3(0, 1, 0), 0),
    []
  );

  const [isOpen, setIsOpen] = useState(false);
  const doorRef = useRef<Object3D>(null);
  const frameRef = useRef<Object3D>(null);
  const targetRotation = isOpen ? Math.PI / 2 : 0;
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
      applyColor(doorNode, doorColor);
    }

    if (frameNode) {
      frameRef.current = frameNode;
      applyColor(frameNode, frameColor);
    }

    scene.traverse(child => {
      if (child instanceof Mesh) {
        child.material = child.material.clone();
        child.material.clipShadows = true;
        child.material.clippingPlanes = [localClippingPlane];
        child.material.needsUpdate = true;
      }
    });
  }, [scene, frameColor]);

  useFrame((_state, delta) => {
    if (!doorRef.current || !groupRef.current) return;

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
        (targetRotation - doorRef.current.rotation.y) * delta * 2;

      if (
        Math.abs(doorRef.current.rotation.y - targetRotation) <
        ROTATION_THRESHOLD
      ) {
        doorRef.current.rotation.y = targetRotation;
        setIsAnimating(false);
      }
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
    setIsAnimating(true);
    log.debug('Door clicked', { isOpen, targetRotation });
  };

  return (
    <group position={[position[0], -1.1, position[2]]} ref={groupRef}>
      <primitive
        object={scene}
        position={[0, 0.5, 0]}
        scale={scale}
        rotation={[0, rotationY, 0]}
      />

      <mesh position={[0, 0.5, 0]} onClick={handleClick} visible={false}>
        <boxGeometry args={[0.8, 1, 0.4]} />
      </mesh>
    </group>
  );
};

// Preload the model
// useGLTF.preload('/vbasic.door.glb');
