import { useDungeon } from '@contexts/dungeon/use-dungeon';
import { darkenColor } from '@helpers/colour';
import { Room as RoomType } from '@model/dungeon';
import { animated, easings, useSpring } from '@react-spring/three';
import { Plane } from '@react-three/drei';
import {
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';

export type RoomRef = {
  mount: () => Promise<boolean>;
  unmount: () => Promise<boolean>;
};

type RoomProps = {
  mountDuration?: number;
  ref?: Ref<RoomRef>;
  renderOrder?: number;
  room?: RoomType;
};

const SCALE = 0.06;

export const Room = ({
  mountDuration = 500,
  ref,
  renderOrder,
  room
}: RoomProps) => {
  const { dungeon } = useDungeon();
  const isMounted = useRef(false);
  const [springs, api] = useSpring(() => ({
    // config: { duration: 8000 },

    opacity: isMounted.current ? 1 : 0
  }));

  const startTransitionAnimation = useCallback(
    (enter: boolean) => {
      return new Promise<boolean>(resolve => {
        if (isMounted.current === enter) {
          resolve(isMounted.current);
          return;
        }

        api.start({
          config: { duration: mountDuration, easing: easings.easeInOutSine },
          onRest: () => {
            isMounted.current = enter;
            resolve(isMounted.current);
          },
          opacity: enter ? 1 : 0
        });
      });
    },
    [api, isMounted, mountDuration]
  );

  useImperativeHandle(ref, () => ({
    mount: () => startTransitionAnimation(true),
    unmount: () => startTransitionAnimation(false)
  }));

  useEffect(() => {
    if (!isMounted.current) {
      startTransitionAnimation(true);
    }
  }, [startTransitionAnimation]);

  if (!room) {
    return null;
  }

  const baseColor = '#e0e0e0';
  const depth = room.depth || 0;
  const colourIncrement = 1 / (dungeon?.maxDepth ?? 1);
  const color = darkenColor(baseColor, depth * colourIncrement);

  const groundColor = room.isCentral ? '#4a9eff' : color;

  const { area } = room;
  const [width, height] = [area.width, area.height];

  return (
    <group>
      <Plane
        args={[width * SCALE, height * SCALE]}
        position={[
          area.x * SCALE + (width * SCALE) / 2,
          -0.001,
          area.y * SCALE + (height * SCALE) / 2
        ]}
        renderOrder={renderOrder}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <animated.meshStandardMaterial
          color={groundColor}
          opacity={springs.opacity}
          transparent
        />
      </Plane>
    </group>
  );
};

Room.displayName = 'Room';
