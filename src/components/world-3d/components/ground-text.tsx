import { animated } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { Suspense, useMemo, type Ref } from 'react';
import { Vector3, type Vector3Tuple } from 'three';
import { floorTextFontUrl } from '../../../assets.generated';
import { useMounted } from './hooks/use-mounted';
import { type EntityRef } from './types';

export type GroundTextRef = EntityRef;

interface GroundTextProps {
  color?: string;
  // URL of the font file
  font?: string;
  maxWidth?: number;
  mountDuration?: number;
  onEnterSpeed?: number;
  position: Vector3 | Vector3Tuple;
  ref?: Ref<GroundTextRef>;
  text: string;
}

// GroundText component to display text aligned with the ground
export const GroundText = ({
  color = '#555',
  font = floorTextFontUrl,
  maxWidth = 3,
  mountDuration = 500,
  position,
  ref,
  text
}: GroundTextProps) => {
  const { springs } = useMounted({
    initialValues: (isMounted: boolean) => ({
      opacity: isMounted ? 1 : 0
    }),
    ref,
    targetValues: (isMounted: boolean) => ({
      duration: isMounted ? mountDuration / 2 : mountDuration,
      opacity: isMounted ? 0 : 1
    })
  });

  const pos = useMemo(
    () =>
      Array.isArray(position)
        ? new Vector3(position[0], position[1], position[2])
        : position,
    [position]
  );

  return (
    <Suspense fallback={null}>
      <Text
        anchorX="center"
        anchorY="middle"
        color={color}
        font={font}
        fontSize={0.5}
        maxWidth={maxWidth}
        position={[pos.x, 0.1, pos.z]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        textAlign="center"
      >
        {text}
        <animated.meshStandardMaterial
          color={color}
          opacity={springs.opacity}
        />
      </Text>
    </Suspense>
  );
};
