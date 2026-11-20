import { atom } from 'jotai';
import { prngIntRange } from '../../../helpers/random';
import type { Door, DungeonData, RoomId } from '../../../model/dungeon';
import {
  currentRoomAtom,
  dungeonAtom,
  nextDoorAtom,
  nextRoomAtom,
  roomHistoryAtom,
  seedAtom,
  visitedRoomsAtom
} from '../atoms';

/**
 * Adds a room to the visited rooms list
 */
export const addVisitedRoomAtom = atom(null, (get, set, roomId: RoomId) => {
  const visitedRooms = get(visitedRoomsAtom);
  const roomHistory = get(roomHistoryAtom);

  const newVisitedRooms = new Set([...visitedRooms, roomId]);

  set(visitedRoomsAtom, Array.from(newVisitedRooms));
  set(roomHistoryAtom, [...roomHistory, roomId]);
});

export const hasVisitedRoomAtom = atom(get => {
  const visitedRooms = get(visitedRoomsAtom);

  return (roomId: RoomId) => visitedRooms.includes(roomId);
});

/**
 * Returns an array of RoomIds that are connected to the given roomId
 */
export const dungeonConnectedRoomsAtom = atom(get => {
  const dungeon: DungeonData | null = get(dungeonAtom);

  return (roomId: RoomId): RoomId[] => {
    if (!dungeon) {
      return [];
    }

    return dungeon.doors
      .filter(door => door.room1 === roomId || door.room2 === roomId)
      .map(door => (door.room1 === roomId ? door.room2 : door.room1));
  };
});

export const dungeonConnectedDoorsAtom = atom(get => {
  const dungeon: DungeonData | null = get(dungeonAtom);

  return (roomId: RoomId): Door[] => {
    if (!dungeon) {
      return [];
    }

    return dungeon.doors.filter(
      door => door.room1 === roomId || door.room2 === roomId
    );
  };
});

/**
 * Returns a function that returns an array of RoomIds that are
 * connected to the given roomId and have not been visited
 *
 */
export const getUnvisitedRoomsAtom = atom(get => {
  const visitedRooms = get(visitedRoomsAtom);
  const getConnectedRooms = get(dungeonConnectedRoomsAtom);

  return (roomId: RoomId) => {
    const connected = getConnectedRooms(roomId);
    return connected.filter(roomId => !visitedRooms.includes(roomId));
  };
});

export const getUnvisitedDoorsAtom = atom(get => {
  const visitedRooms = get(visitedRoomsAtom);
  const getConnectedDoors = get(dungeonConnectedDoorsAtom);

  return (roomId: RoomId) => {
    const connected = getConnectedDoors(roomId);
    return connected.filter(
      door =>
        !visitedRooms.includes(door.room1) || !visitedRooms.includes(door.room2)
    );
  };
});

/**
 * Calculates the connecting door id and room id of the next room to visit
 */
export const applyNextRoomAtom = atom(null, (get, set) => {
  const seed = get(seedAtom);
  const currentRoomId = get(currentRoomAtom);
  // const unvisitedRooms = get(getUnvisitedRoomsAtom)(currentRoomId);
  const unvisitedDoors = get(getUnvisitedDoorsAtom)(currentRoomId);

  if (unvisitedDoors.length > 0) {
    const [nextSeed, nextDoorIndex] = prngIntRange(
      seed,
      0,
      unvisitedDoors.length - 1
    );
    const nextDoor = unvisitedDoors[nextDoorIndex];
    set(seedAtom, nextSeed);
    set(
      nextRoomAtom,
      nextDoor.room1 === currentRoomId ? nextDoor.room2 : nextDoor.room1
    );
    set(nextDoorAtom, nextDoor.id);

    return;
  }

  // no unvisited rooms, so we need to go back to the last room
  const roomHistory = get(roomHistoryAtom);
  const lastRoomId = roomHistory.at(-1);

  if (lastRoomId) {
    // find the door that connects the last room to the current room
    const lastDoor = get(dungeonConnectedDoorsAtom)(lastRoomId).find(
      door => door.room1 === currentRoomId || door.room2 === currentRoomId
    );
    if (lastDoor) {
      set(
        nextRoomAtom,
        lastDoor.room1 === currentRoomId ? lastDoor.room2 : lastDoor.room1
      );
      set(nextDoorAtom, lastDoor.id);
    }
    return;
  }

  // no next room found
  set(nextDoorAtom, null);
  set(nextRoomAtom, null);
});
