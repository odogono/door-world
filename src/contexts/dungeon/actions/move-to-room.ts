import { getRoomDoors } from '@model/dungeon/door';
import {
  getDungeonConnectingRoom,
  getDungeonDoorById,
  updateDungeonDoorState
} from '@model/dungeon/helpers';
import { getRoomCenter } from '@model/dungeon/room';
import { Position } from '@model/dungeon/types';
import { atom } from 'jotai';
import { dungeonAtom, dungeonCurrentRoomAtom } from '../atoms';
import { setDungeonVisibleAtom } from './set-visible';

type MoveToRoomProps = {
  doorAction: (doorId: string, open: boolean) => Promise<boolean>;
  doorId: string;
  moveCameraAction: (position: Position | null) => Promise<void>;
  // roomId: RoomId;
};

export const moveToRoomAtom = atom(
  null,
  async (get, set, props: MoveToRoomProps) => {
    const { doorAction, doorId, moveCameraAction } = props;

    const currentRoomId = get(dungeonCurrentRoomAtom);

    const door = getDungeonDoorById(get(dungeonAtom), props.doorId);

    if (!door) {
      return;
    }

    // TODO determine whether the door can be opened

    // 1. open the door and move the camera to the door
    await Promise.all([
      doorAction(doorId, true),
      moveCameraAction(door.position)
    ]);

    // 2. update the door status
    set(dungeonAtom, dungeon => updateDungeonDoorState(dungeon, doorId, true));

    // get the next room
    const nextRoom = getDungeonConnectingRoom(
      get(dungeonAtom),
      currentRoomId,
      door
    );

    if (!nextRoom) {
      throw new Error('Next room not found');
    }

    // set the so both rooms and doors are showing
    set(setDungeonVisibleAtom, {
      doors: getRoomDoors(get(dungeonAtom), nextRoom),
      rooms: [nextRoom]
    });

    // 3. Enter the target room
    await moveCameraAction(getRoomCenter(get(dungeonAtom), nextRoom));
    set(dungeonCurrentRoomAtom, nextRoom.id);

    // 4. close the door
    await doorAction(doorId, false);
    set(dungeonAtom, dungeon => updateDungeonDoorState(dungeon, doorId, false));

    // clear the old rooms and doors
    set(setDungeonVisibleAtom, {
      clear: true,
      doors: getRoomDoors(get(dungeonAtom), nextRoom),
      rooms: [nextRoom]
    });
  }
);
