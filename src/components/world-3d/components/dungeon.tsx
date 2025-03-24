import {
  useDungeonCurrentRoom,
  useDungeonOpenDoorAtom
} from '@contexts/dungeon/atoms';
import { createLog } from '@helpers/log';
import {
  Door as DoorModel,
  DungeonData,
  getRoomDoors,
  Room
} from '@model/dungeon';
import { Position } from '@model/dungeon/types';
import { useCallback, useRef } from 'react';
import { Vector3, Vector3Tuple } from 'three';
import { Door as Door3d, DoorRef } from './door';
import { Room as Room3d, RoomRef } from './room';

const log = createLog('Dungeon');

type DungeonProps = {
  currentRoom: Room | null | undefined;
  dungeon: DungeonData | null;
  moveCameraTo: (pos: Vector3 | Vector3Tuple, zoom?: number) => Promise<void>;
};

const SCALE = 0.06;

export const Dungeon = ({ moveCameraTo }: DungeonProps) => {
  const { currentRoom, dungeon } = useDungeonCurrentRoom();
  const openDoor = useDungeonOpenDoorAtom();
  // const [_isPending, startTransition] = useTransition();

  // Store refs for all doors and rooms
  const doorRefs = useRef<Map<string, DoorRef>>(new Map());
  const roomRefs = useRef<Map<number, RoomRef>>(new Map());

  const handleDoorTouch = useCallback(
    async (door: DoorModel) => {
      log.debug('Door clicked', door.id);

      // Get the refs we need
      const doorRef = doorRefs.current.get(door.id);
      // const currentRoomRef = currentRoom
      //   ? roomRefs.current.get(currentRoom.id)
      //   : null;
      // const targetRoomId =
      // door.room1 === currentRoom?.id ? door.room2 : door.room1;
      // const targetRoomRef = roomRefs.current.get(targetRoomId);

      if (!doorRef) {
        log.error('Missing refs for door transition', { doorId: door.id });
        return;
      }

      await Promise.all([
        // Start the transition sequence
        // async () => {
        // 1. Open the door
        openDoor({
          action: doorRef.setOpen,
          doorId: door.id,
          open: true
        }),

        moveCameraTo(dungeonPositionToVector3(door.position))
      ]);

      // 2. Exit the current room
      // await currentRoomRef.exit();

      // 3. Enter the target room
      // await targetRoomRef.enter();

      // 4. Close the door
      // await doorRef.close();
      // });

      // Use React 19's use hook to handle the promise
      // use(transition());
    },
    [openDoor, moveCameraTo]
  );

  if (!dungeon) {
    return null;
  }

  const rooms = [currentRoom!];
  const doors = getRoomDoors(dungeon, currentRoom);

  log.debug('render');

  return (
    <>
      {rooms.map(room => (
        <Room3d
          dungeon={dungeon}
          key={room.id}
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
              log.debug('Mounting door', door.id);
              doorRefs.current.set(door.id, ref);
            }
            return () => {
              log.debug('Unmounting door', door.id);
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

const dungeonPositionToVector3 = (position: Position): Vector3 => {
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
  });

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
