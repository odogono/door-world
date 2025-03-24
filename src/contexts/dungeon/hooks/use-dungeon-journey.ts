import { getRoomDoors } from '@model/dungeon/door';
import { getDungeonRoomById } from '@model/dungeon/helpers';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { moveToRoomAtom } from '../actions/move-to-room';
import {
  dungeonAtom,
  dungeonCurrentRoomAtom,
  dungeonVisibleDoorsAtom,
  dungeonVisibleRoomsAtom
} from '../atoms';

const initialiseDungeonJourneyAtom = atom(null, async (get, set) => {
  const dungeon = get(dungeonAtom);
  const currentRoomId = get(dungeonCurrentRoomAtom);

  const currentRoom = getDungeonRoomById(dungeon, currentRoomId);

  if (!currentRoom) {
    throw new Error('Current room not found');
  }

  const visibleDoors = getRoomDoors(dungeon, currentRoom);

  set(dungeonVisibleRoomsAtom, [currentRoom]);
  set(dungeonVisibleDoorsAtom, visibleDoors);
});

export const useDungeonJourney = () => {
  const initialiseDungeonJourney = useSetAtom(initialiseDungeonJourneyAtom);
  const doors = useAtomValue(dungeonVisibleDoorsAtom);
  const rooms = useAtomValue(dungeonVisibleRoomsAtom);
  const moveToRoom = useSetAtom(moveToRoomAtom);

  useEffect(() => {
    initialiseDungeonJourney();
  }, [initialiseDungeonJourney]);

  return {
    doors,
    moveToRoom,
    rooms
  };
};
