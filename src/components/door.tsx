import { createLog } from '@helpers/log';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Object3D } from 'three';
import { applyColor } from '../helpers/object-3d';

interface DoorProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  frameColor?: string;
  doorColor?: string;
}

const log = createLog('Door');

const ROTATION_THRESHOLD = 0.01; // Threshold to determine if animation is complete

export const Door = ({
  position = [0, 0.5, 0],
  scale = [1, 1, 1],
  rotation = [0, -Math.PI / 2, 0],
  doorColor = '#83D5FF',
  frameColor = '#FFF'
}: DoorProps) => {
  const { scene } = useGLTF('/vbasic.door.glb');
  const [isOpen, setIsOpen] = useState(false);
  const doorRef = useRef<Object3D>(null);
  const frameRef = useRef<Object3D>(null);
  const targetRotation = isOpen ? Math.PI / 2 : 0;
  const [isAnimating, setIsAnimating] = useState(false);

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

    // Cleanup function to dispose of the model when component unmounts
    return () => {
      useGLTF.preload('/vbasic.door.glb');
    };
  }, [scene, frameColor]);

  useFrame((_state, delta) => {
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
    <>
      <primitive
        object={scene}
        position={position}
        scale={scale}
        rotation={rotation}
      />
      <mesh position={position} onClick={handleClick} visible={false}>
        <boxGeometry args={[0.8, 1, 0.4]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  );
};

// Preload the model
useGLTF.preload('/vbasic.door.glb');
