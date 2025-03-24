import { useDungeon } from '@contexts/dungeon/use-dungeon';
import { darkenColor } from '@helpers/colour';
import { createLog } from '@helpers/log';
import { Room as RoomModel } from '@model/dungeon';
import { animated } from '@react-spring/three';
import { Plane } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { Ref, useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import { GroundText, GroundTextRef } from './ground-text';
import { useMounted } from './hooks/useMounted';
import { EntityRef } from './types';

const log = createLog('Room');

export type RoomRef = EntityRef;

export type RoomTouchEvent = {
  local: Vector3;
  room: RoomModel;
  world: Vector3;
};

type RoomProps = {
  mountDuration?: number;
  onTouch?: (event: RoomTouchEvent) => void;
  ref?: Ref<RoomRef>;
  renderOrder?: number;
  room?: RoomModel;
};

const SCALE = 0.06;

export const Room = ({
  mountDuration = 500,
  onTouch,
  ref,
  renderOrder,
  room
}: RoomProps) => {
  const { dungeon } = useDungeon();
  const textRef = useRef<GroundTextRef>(null);
  const { springs } = useMounted({
    mountDuration,
    onMount: async () => {
      // log.debug('Mounted', room?.id);

      // runAfter(3000, () => textRef.current?.unmount());
      return true;
    },
    onUnmount: () => {
      if (textRef.current) {
        return textRef.current.unmount();
      }
      return Promise.resolve(true);
    },
    ref
  });

  const position = useMemo(() => {
    if (!room) {
      return null;
    }
    const { height, width, x, y } = room.area;

    return new Vector3(
      x * SCALE + (width * SCALE) / 2,
      -0.001,
      y * SCALE + (height * SCALE) / 2
    );

    // return new Vector3(room.area.x, 0, room.area.y);
  }, [room]);

  const handleTouch = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    const local = new Vector3(event.point.x, 0, event.point.z);
    const world = local; // local.add(position!);

    if (onTouch) {
      onTouch({ local, room: room!, world });
    }
  };

  if (!room || !position) {
    return null;
  }

  const baseColor = '#e0e0e0';
  const depth = room.depth || 0;
  const colourIncrement = 1 / (dungeon?.maxDepth ?? 1);
  const color = darkenColor(baseColor, depth * colourIncrement);

  const groundColor = room.isCentral ? '#4a9eff' : color;
  const text = room.isCentral ? 'Open Door Go North' : `Room ${room.id}`;

  const { area } = room;
  const [width, height] = [area.width, area.height];

  return (
    <group>
      <Plane
        args={[width * SCALE, height * SCALE]}
        onClick={handleTouch}
        position={position}
        renderOrder={renderOrder}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <animated.meshStandardMaterial
          color={groundColor}
          opacity={springs.opacity}
          transparent
        />
      </Plane>
      <GroundText
        mountDuration={200}
        position={position}
        ref={textRef}
        text={text}
      />
    </group>
  );
};
