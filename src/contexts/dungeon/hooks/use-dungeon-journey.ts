import { createLog } from '@helpers/log';
import { getRoomDoors } from '@model/dungeon/door';
import { getDungeonRoomById } from '@model/dungeon/helpers';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { moveToRoomAtom } from '../actions/move-to-room';
import {
  dungeonAtom,
  dungeonCurrentRoomAtom,
  dungeonVisibleDoorsAtom,
  dungeonVisibleRoomsAtom
} from '../atoms';

const log = createLog('useDungeonJourney');

const isInitialisedAtom = atom(false);

const initialiseDungeonJourneyAtom = atom(null, async (get, set) => {
  if (get(isInitialisedAtom)) {
    return;
  }

  // re-initialise the dungeon journey
  set(dungeonCurrentRoomAtom, 1);

  const dungeon = get(dungeonAtom);
  const currentRoomId = get(dungeonCurrentRoomAtom);

  const currentRoom = getDungeonRoomById(dungeon, currentRoomId);

  if (!currentRoom) {
    // throw new Error('Current room not found');
    return;
  }

  const visibleDoors = getRoomDoors(dungeon, currentRoom);

  set(dungeonVisibleRoomsAtom, [currentRoom]);
  set(dungeonVisibleDoorsAtom, visibleDoors);

  set(isInitialisedAtom, true);

  log.debug('Dungeon journey initialised', { currentRoomId });
});

export const useDungeonJourney = () => {
  const dungeon = useAtomValue(dungeonAtom);
  const initialiseDungeonJourney = useSetAtom(initialiseDungeonJourneyAtom);
  const doors = useAtomValue(dungeonVisibleDoorsAtom);
  const rooms = useAtomValue(dungeonVisibleRoomsAtom);
  const moveToRoom = useSetAtom(moveToRoomAtom);
  const currentRoomId = useAtomValue(dungeonCurrentRoomAtom);
  const currentRoom = useMemo(
    () => getDungeonRoomById(dungeon, currentRoomId),
    [dungeon, currentRoomId]
  );

  useEffect(() => {
    initialiseDungeonJourney();
  }, [initialiseDungeonJourney]);

  return {
    currentRoom,
    currentRoomId,
    doors,
    dungeon,
    moveToRoom,
    rooms
  };
};
