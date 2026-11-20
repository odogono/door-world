import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { createLog } from '../../../helpers/log';
import { getRoomDoors } from '../../../model/dungeon/door';
import { getDungeonRoomById } from '../../../model/dungeon/helpers';
import { moveToRoomAtom } from '../actions/move-to-room';
import { addVisitedRoomAtom, applyNextRoomAtom } from '../actions/room-history';
import {
  getVisibleDoorsAtom,
  getVisibleRoomsAtom
} from '../actions/set-visible';
import {
  currentRoomAtom,
  dungeonAtom,
  nextDoorAtom,
  nextRoomAtom,
  visibleDoorsAtom,
  visibleRoomsAtom
} from '../atoms';

const log = createLog('useDungeonJourney');

const isInitialisedAtom = atom(false);

const initialiseDungeonJourneyAtom = atom(null, async (get, set) => {
  if (get(isInitialisedAtom)) {
    return;
  }

  // re-initialise the dungeon journey
  const currentRoomId = 1;
  set(currentRoomAtom, currentRoomId);

  const dungeon = get(dungeonAtom);

  const currentRoom = getDungeonRoomById(dungeon, currentRoomId);

  if (!currentRoom) {
    // throw new Error('Current room not found');
    return;
  }

  const visibleDoors = getRoomDoors(dungeon, currentRoom);

  set(visibleRoomsAtom, [currentRoomId]);
  set(
    visibleDoorsAtom,
    visibleDoors.map(door => door.id)
  );
  set(addVisitedRoomAtom, currentRoomId);
  set(applyNextRoomAtom);
  set(isInitialisedAtom, true);

  const nextRoomId = get(nextRoomAtom);

  log.debug('Dungeon journey initialised', { currentRoomId, nextRoomId });
});

export const useDungeonJourney = () => {
  const dungeon = useAtomValue(dungeonAtom);
  const initialiseDungeonJourney = useSetAtom(initialiseDungeonJourneyAtom);
  const doors = useAtomValue(getVisibleDoorsAtom);
  const rooms = useAtomValue(getVisibleRoomsAtom);
  const moveToRoom = useSetAtom(moveToRoomAtom);
  const currentRoomId = useAtomValue(currentRoomAtom);
  const currentRoom = useMemo(
    () => getDungeonRoomById(dungeon, currentRoomId),
    [dungeon, currentRoomId]
  );
  const nextDoorId = useAtomValue(nextDoorAtom);

  useEffect(() => {
    initialiseDungeonJourney();
  }, [initialiseDungeonJourney]);

  return {
    currentRoom,
    currentRoomId,
    doors,
    dungeon,
    moveToRoom,
    nextDoorId,
    rooms
  };
};
