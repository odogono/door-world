import { atom } from 'jotai';
import { createLog } from '../../../helpers/log';
import {
  getRoomDoors,
  getRoomDoorsExcluding
} from '../../../model/dungeon/door';
import {
  getDungeonConnectedRooms,
  getDungeonConnectingRoom,
  getDungeonDoorById,
  updateDungeonDoorState
} from '../../../model/dungeon/helpers';
import { getRoomCenter } from '../../../model/dungeon/room';
import type { Position } from '../../../model/dungeon/types';
import {
  currentRoomAtom,
  dungeonAtom,
  nextRoomAtom,
  visitedRoomsAtom
} from '../atoms';
import {
  addVisitedRoomAtom,
  applyNextRoomAtom,
  hasVisitedRoomAtom
} from './room-history';
import { setVisibleEntitiesAtom } from './set-visible';

const log = createLog('moveToRoomAtom', ['debug']);

interface MoveToRoomProps {
  doorAction: (doorId: string, open: boolean) => Promise<boolean>;
  doorId: string;
  moveCameraAction: (position: Position | null) => Promise<void>;
  unmountRoomAction: (roomId: number, doorIds: string[]) => Promise<boolean>;
}

export const moveToRoomAtom = atom(
  null,
  async (get, set, props: MoveToRoomProps) => {
    const { doorAction, doorId, moveCameraAction, unmountRoomAction } = props;

    const currentRoomId = get(currentRoomAtom);

    const door = getDungeonDoorById(get(dungeonAtom), props.doorId);

    if (!door) {
      log.error('Door not found', { doorId });
      return;
    }

    // TODO determine whether the door can be opened - it could be locked!

    // 1. open the door and move the camera to the door
    log.debug('Opening door', { doorId });
    await Promise.all([
      doorAction(doorId, true),
      moveCameraAction(door.position)
    ]);

    // 2. update the door status
    log.debug('Updating door status', { doorId });
    set(dungeonAtom, dungeon => updateDungeonDoorState(dungeon, doorId, true));

    // get the next room
    const nextRoom = getDungeonConnectingRoom(
      get(dungeonAtom),
      currentRoomId,
      door
    );

    if (!nextRoom) {
      log.error('Next room not found', { doorId });
      throw new Error('Next room not found');
    }

    // set both rooms and doors are showing
    set(setVisibleEntitiesAtom, {
      doors: getRoomDoors(get(dungeonAtom), nextRoom),
      rooms: [nextRoom]
    });

    const hasVisitedRoom = get(hasVisitedRoomAtom)(nextRoom.id);
    const visitedRooms = get(visitedRoomsAtom);

    if (hasVisitedRoom) {
      log.debug('Room already visited', {
        roomId: nextRoom.id,
        visitedRooms
      });
    } else {
      log.debug('Room not visited', {
        roomId: nextRoom.id,
        visitedRooms
      });
    }

    // 3. Enter the target room
    log.debug('Moving camera to room', { roomId: nextRoom.id });
    await moveCameraAction(getRoomCenter(get(dungeonAtom), nextRoom));
    set(currentRoomAtom, nextRoom.id);
    set(addVisitedRoomAtom, nextRoom.id);

    // 4. close the door
    log.debug('Closing door', { doorId });
    await doorAction(doorId, false);
    set(dungeonAtom, dungeon => updateDungeonDoorState(dungeon, doorId, false));

    // 5. unmount the current room
    // get the doors which exist in the current room, but not in the nextRoom
    log.debug('Unmounting room', { roomId: currentRoomId });
    const unmountDoorIds = getRoomDoorsExcluding(
      get(dungeonAtom),
      currentRoomId,
      nextRoom.id
    ).map(door => door.id);

    await unmountRoomAction(currentRoomId, unmountDoorIds);

    // clear the old rooms and doors
    set(setVisibleEntitiesAtom, {
      clear: true,
      doors: getRoomDoors(get(dungeonAtom), nextRoom),
      rooms: [nextRoom]
    });

    log.debug('Moved to room', { roomId: nextRoom.id });
    log.debug('Connected rooms', {
      connectedRooms: getDungeonConnectedRooms(get(dungeonAtom), nextRoom.id),
      roomId: nextRoom.id
    });

    set(applyNextRoomAtom);

    log.debug('Next room', { nextRoomId: get(nextRoomAtom) });
  }
);
