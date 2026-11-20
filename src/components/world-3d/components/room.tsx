import { animated } from '@react-spring/three';
import { Plane } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef, type Ref } from 'react';
import { Vector3 } from 'three';
import { useDungeon } from '../../../contexts/dungeon/use-dungeon';
import { useTheme } from '../../../contexts/theme/context';
import {
  darkenColor,
  getContrastColor,
  lightenColor
} from '../../../helpers/colour';
import { createLog } from '../../../helpers/log';
import { FloorType, type Room as RoomModel } from '../../../model/dungeon';
import { GroundText, type GroundTextRef } from './ground-text';
import { useMounted } from './hooks/use-mounted';
import { useRoomText } from './hooks/use-room-text';
import { type EntityRef } from './types';

const log = createLog('Room');

export type RoomRef = EntityRef;

export interface RoomTouchEvent {
  local: Vector3;
  room: RoomModel;
  world: Vector3;
}

interface RoomProps {
  mountDuration?: number;
  onTouch?: (event: RoomTouchEvent) => void;
  ref?: Ref<RoomRef>;
  renderOrder?: number;
  room?: RoomModel;
}

const SCALE = 0.06;

const TEXT_CYCLE_INTERVAL = 6000;
const TEXT_TRANSITION_DURATION = 1000;

export const Room = ({
  mountDuration = 500,
  onTouch,
  ref,
  renderOrder,
  room
}: RoomProps) => {
  const textRef = useRef<GroundTextRef>(null);

  const { runTextTransition, text: groundText } = useRoomText({
    interval: TEXT_CYCLE_INTERVAL,
    room,
    textRef
  });

  const { springs } = useMounted({
    initialValues: (isMounted: boolean) => ({
      opacity: isMounted ? 1 : 0
    }),
    onMount: async () => {
      log.debug('Room mounted', room?.id);
      // Start the text cycling after initial mount
      runTextTransition();

      return true;
    },
    onUnmount: () => {
      if (textRef.current) {
        return textRef.current.unmount();
      }
      return Promise.resolve(true);
    },
    ref,
    targetValues: (isMounted: boolean) => ({
      duration: isMounted ? mountDuration / 2 : mountDuration,
      opacity: isMounted ? 0 : 1
    })
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
  }, [room]);

  const handleTouch = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    const local = new Vector3(event.point.x, 0, event.point.z);
    const world = local; // local.add(position!);

    if (onTouch) {
      onTouch({ local, room: room!, world });
    }
  };

  const { groundColor, groundOpacity, textColor } = useRoomColors(room);

  if (!room || !position) {
    return null;
  }

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
          opacity={groundOpacity ?? springs.opacity}
          transparent
        />
      </Plane>
      <GroundText
        color={textColor}
        maxWidth={Math.min(3, width * SCALE * 0.8)}
        mountDuration={TEXT_TRANSITION_DURATION}
        position={position}
        ref={textRef}
        text={groundText}
      />
    </group>
  );
};

const useRoomColors = (room: RoomModel | undefined) => {
  const { dungeon } = useDungeon();
  const { colors, theme } = useTheme();
  const { maxDepth } = dungeon ?? { maxDepth: 1 };
  const roomDepth = room?.depth ?? 1;
  const floorType = room?.floorType ?? FloorType.SOLID;
  // const { depth: roomDepth, floorType } = room;

  const groundOpacity = floorType === FloorType.TRANSPARENT ? 0 : undefined;

  const groundColor = useMemo(() => {
    if (floorType === FloorType.TRANSPARENT) {
      return colors.background;
    }
    const baseColor = theme === 'dark' ? '#e0e0e0' : '#d6d5d3';
    const depth = roomDepth || 0;
    const colourIncrement = 1 / maxDepth;

    if (theme === 'light') {
      return lightenColor(baseColor, depth * colourIncrement);
    }
    return darkenColor(baseColor, depth * colourIncrement);
  }, [floorType, roomDepth, maxDepth, theme, colors]);

  const textColor = useMemo(() => {
    if (floorType === FloorType.TRANSPARENT) {
      return colors.foreground;
    }

    const contrastColor = getContrastColor(groundColor);
    return contrastColor;
  }, [groundColor, floorType, colors]);

  return {
    groundColor,
    groundOpacity,
    textColor
  };
};
