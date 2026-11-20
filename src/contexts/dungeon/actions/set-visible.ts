import { atom } from 'jotai';
import type { Door, DoorId, Room, RoomId } from '../../../model/dungeon';
import { dungeonAtom, visibleDoorsAtom, visibleRoomsAtom } from '../atoms';

const mergeUniqueById = <T extends string | number>(
  arr1: T[],
  arr2: T[]
): T[] => {
  const ids = new Set(arr1);
  return [...arr1, ...arr2.filter(id => !ids.has(id))];
};

interface SetDungeonVisibleProps {
  clear?: boolean;
  doors: Door[];
  rooms: Room[];
}

export const setVisibleEntitiesAtom = atom(
  null,
  (get, set, props: SetDungeonVisibleProps) => {
    const { clear = false, doors, rooms } = props;

    const roomIds: RoomId[] = rooms.map(room => room.id);
    const doorIds: DoorId[] = doors.map(door => door.id);

    if (clear) {
      set(visibleRoomsAtom, roomIds);
      set(visibleDoorsAtom, doorIds);
    }

    const newRooms = mergeUniqueById(get(visibleRoomsAtom), roomIds);
    set(visibleRoomsAtom, newRooms);

    const newDoors = mergeUniqueById(get(visibleDoorsAtom), doorIds);
    set(visibleDoorsAtom, newDoors);
  }
);

/**
 * Returns a list of Room objects that are currently visible in the dungeon
 */
export const getVisibleRoomsAtom = atom(get => {
  const roomIds = get(visibleRoomsAtom);
  const dungeon = get(dungeonAtom);
  if (!dungeon) {
    return [];
  }
  return dungeon.rooms.filter(room => roomIds.includes(room.id));
});

/**
 * Returns a list of Door objects that are currently visible in the dungeon
 */
export const getVisibleDoorsAtom = atom(get => {
  const doorIds = get(visibleDoorsAtom);
  const dungeon = get(dungeonAtom);
  if (!dungeon) {
    return [];
  }
  return dungeon.doors.filter(door => doorIds.includes(door.id));
});
