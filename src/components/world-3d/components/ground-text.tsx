import { animated } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { Ref, Suspense, useMemo } from 'react';
import { Vector3, Vector3Tuple } from 'three';
import { useMounted } from './hooks/useMounted';
import { EntityRef } from './types';

export type GroundTextRef = EntityRef;

interface GroundTextProps {
  // Path to the font file relative to the public directory
  font?: string;
  mountDuration?: number;
  onEnterSpeed?: number;
  position: Vector3 | Vector3Tuple;
  ref?: Ref<GroundTextRef>;
  text: string;
}

// GroundText component to display text aligned with the ground
export const GroundText = ({
  font = '/fonts/Nohemi-Bold-BF6438cc587b5b5.ttf',
  mountDuration = 500,
  position,
  ref,
  text
}: GroundTextProps) => {
  const { springs } = useMounted({
    mountDuration,
    ref
  });

  const pos = useMemo(
    () =>
      Array.isArray(position)
        ? new Vector3(position[0], position[1], position[2])
        : position,
    [position]
  );
  // const posRef = useRef(pos);

  // const [opacity, setOpacity] = useState(0);
  // const materialRef = useRef<MeshStandardMaterial>(null);

  // useEffect(() => {
  //   if (!posRef.current.equals(pos)) {
  //     setOpacity(0);
  //     posRef.current.copy(pos);
  //   }
  // }, [pos]);

  // useFrame(() => {
  //   if (opacity < 1) {
  //     setOpacity(prev => Math.min(prev + onEnterSpeed, 1));
  //   }
  // });

  return (
    <Suspense fallback={null}>
      <Text
        anchorX="center"
        anchorY="middle"
        color="#555"
        font={font}
        fontSize={0.5}
        maxWidth={3}
        position={[pos.x, 0.1, pos.z]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        textAlign="center"
      >
        {text}
        <animated.meshStandardMaterial color="#555" opacity={springs.opacity} />
      </Text>
    </Suspense>
  );
};
