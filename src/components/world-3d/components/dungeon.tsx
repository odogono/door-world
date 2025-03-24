import { useDungeonJourney } from '@contexts/dungeon/hooks/use-dungeon-journey';
import { createLog } from '@helpers/log';
import { useRenderingTrace } from '@helpers/use-rendering-trace';
import { Door as DoorModel } from '@model/dungeon';
import { Position } from '@model/dungeon/types';
import { useCallback, useRef } from 'react';
import { Vector3, Vector3Tuple } from 'three';
import { Door as Door3d, DoorRef } from './door';
import { Room as Room3d, RoomRef, RoomTouchEvent } from './room';

const log = createLog('Dungeon');

type DungeonProps = {
  moveCameraTo: (pos: Vector3 | Vector3Tuple, zoom?: number) => Promise<void>;
};

const SCALE = 0.06;

export const Dungeon = ({ moveCameraTo }: DungeonProps) => {
  const { doors, moveToRoom, rooms } = useDungeonJourney();
  const isMoving = useRef(false);

  // Store refs for all doors and rooms
  const doorRefs = useRef<Map<string, DoorRef>>(new Map());
  const roomRefs = useRef<Map<number, RoomRef>>(new Map());

  const handleDoorTouch = useCallback(
    async (door: DoorModel) => {
      log.debug('Door clicked', door.id);

      // Get the refs we need
      const doorRef = doorRefs.current.get(door.id);

      if (!doorRef) {
        log.error('Missing refs for door transition', { doorId: door.id });
        return;
      }

      if (isMoving.current) {
        return;
      }

      isMoving.current = true;

      await moveToRoom({
        doorAction: async (doorId: string, open: boolean) => {
          const doorRef = doorRefs.current.get(doorId);

          if (!doorRef) {
            return false;
          }

          await doorRef.setOpen(open);

          return true;
        },
        doorId: door.id,
        moveCameraAction: (position: Position | null) =>
          moveCameraTo(dungeonPositionToVector3(position)!),
        unmountRoomAction: (roomId: number, doorIds: string[]) => {
          const roomRef = roomRefs.current.get(roomId);

          if (!roomRef) {
            return Promise.resolve(false);
          }

          const refs = doorIds.map(id => doorRefs.current.get(id)) as DoorRef[];

          return Promise.all([
            roomRef.unmount(),
            ...refs.map(ref => ref.unmount())
          ]).then(() => true);
        }
      });

      isMoving.current = false;
    },
    [moveToRoom, moveCameraTo]
  );

  const handleRoomTouch = useCallback(
    (event: RoomTouchEvent) => {
      log.debug('Room clicked', event.room.id, event.world);
      moveCameraTo(event.world);
    },
    [moveCameraTo]
  );

  // const rooms = [currentRoom!];
  // const doors = getRoomDoors(dungeon, currentRoom);

  // log.debug('render');
  useRenderingTrace('Dungeon', {
    doors,
    rooms
  });

  // log.debug('currentRoom', currentRoom);

  return (
    <>
      {rooms.map(room => (
        <Room3d
          key={room.id}
          onTouch={handleRoomTouch}
          ref={(ref: RoomRef | null) => {
            if (ref) {
              roomRefs.current.set(room.id, ref);
            }
            return () => {
              roomRefs.current.delete(room.id);
            };
          }}
          room={room}
        />
      ))}
      {doors.map(door => (
        <DoorContainer
          door={door}
          key={door.id}
          onTouch={handleDoorTouch}
          ref={(ref: DoorRef | null) => {
            if (ref) {
              // log.debug('Mounting door', door.id);
              doorRefs.current.set(door.id, ref);
            }
            return () => {
              // log.debug('Unmounting door', door.id);
              doorRefs.current.delete(door.id);
            };
          }}
        />
      ))}
    </>
  );
};

type DoorContainerProps = {
  door: DoorModel;
  onTouch: (door: DoorModel) => void;
  ref: React.Ref<DoorRef>;
};

const dungeonPositionToVector3 = (
  position: Position | null
): Vector3 | null => {
  if (!position) {
    return null;
  }

  const result = new Vector3(position.x, 0, position.y);

  result.multiplyScalar(SCALE);

  return result;
};

const DOOR_SIZE = 4;
const DoorContainer = ({ door, onTouch, ref }: DoorContainerProps) => {
  const { position, room1, room2 } = door;

  const position3d = dungeonPositionToVector3({
    x: position.x + DOOR_SIZE,
    y: position.y + DOOR_SIZE
  })!;

  // const position3d = new Vector3(
  //   position.x + DOOR_SIZE,
  //   0,
  //   position.y + DOOR_SIZE
  // );
  // position3d.multiplyScalar(SCALE);
  const rotationY = getDoorRotationY(door);

  const handleTouch = useCallback(() => {
    onTouch(door);
  }, [door, onTouch]);

  return (
    <Door3d
      doorColor="#00f900"
      id={door.id}
      isMounted={false}
      isOpen={door.isOpen}
      onTouch={handleTouch}
      position={position3d}
      ref={ref}
      rotationY={rotationY}
    />
  );
};

const getDoorRotationY = (door: DoorModel) => {
  const { dir } = door;

  switch (dir) {
    case 'NORTH':
      return -Math.PI / 2;
    case 'EAST':
      return -Math.PI;
    case 'SOUTH':
      return Math.PI / 2;
    case 'WEST':
      return 0;
  }
};
