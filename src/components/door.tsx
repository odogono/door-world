import { createLog } from '@helpers/log';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Group, Object3D } from 'three';

interface DoorProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

const log = createLog('Door');

const ROTATION_THRESHOLD = 0.01; // Threshold to determine if animation is complete

export const Door = ({
  position = [0, 0.5, 0],
  scale = [1, 1, 1],
  rotation = [0, -Math.PI / 2, 0]
}: DoorProps) => {
  const { scene } = useGLTF('/vbasic.door.glb');
  const [isOpen, setIsOpen] = useState(false);
  const doorRef = useRef<Object3D>(null);
  const targetRotation = isOpen ? Math.PI / 2 : 0;
  const [isAnimating, setIsAnimating] = useState(false);

  // log.debug('scene', scene);
  // log.debug('nodes', nodes);
  // log.debug('materials', materials);

  useEffect(() => {
    // Find the door node and store its reference
    const doorNode = scene.getObjectByName('door');
    if (doorNode) {
      doorRef.current = doorNode;
      log.debug('Found door node', doorNode);
    } else {
      log.debug('No door node found in scene');
    }

    // Cleanup function to dispose of the model when component unmounts
    return () => {
      useGLTF.preload('/vbasic.door.glb');
    };
  }, [scene]);

  useFrame((state, delta) => {
    if (!doorRef.current || !isAnimating) return;

    // Smoothly interpolate the rotation
    doorRef.current.rotation.y +=
      (targetRotation - doorRef.current.rotation.y) * delta * 2;

    // Check if we're close enough to the target rotation
    if (
      Math.abs(doorRef.current.rotation.y - targetRotation) < ROTATION_THRESHOLD
    ) {
      doorRef.current.rotation.y = targetRotation;
      setIsAnimating(false);
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
    setIsAnimating(true);
    log.debug('Door clicked', { isOpen, targetRotation });
  };

  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
      rotation={rotation}
      onClick={handleClick}
    />
  );
};

// Preload the model
useGLTF.preload('/vbasic.door.glb');
