import { Door, Room } from '@model/dungeon';
import { atom } from 'jotai';
import { dungeonVisibleDoorsAtom, dungeonVisibleRoomsAtom } from '../atoms';

const mergeUniqueById = <T extends { id: string | number }>(
  arr1: T[],
  arr2: T[]
): T[] => {
  const ids = new Set(arr1.map(obj => obj.id));
  return [...arr1, ...arr2.filter(obj => !ids.has(obj.id))];
};

type SetDungeonVisibleProps = {
  clear?: boolean;
  doors: Door[];
  rooms: Room[];
};

export const setDungeonVisibleAtom = atom(
  null,
  (get, set, props: SetDungeonVisibleProps) => {
    const { clear = false, doors, rooms } = props;

    if (clear) {
      set(dungeonVisibleRoomsAtom, rooms);
      set(dungeonVisibleDoorsAtom, doors);
    }

    const newRooms = mergeUniqueById(get(dungeonVisibleRoomsAtom), rooms);
    set(dungeonVisibleRoomsAtom, newRooms);

    const newDoors = mergeUniqueById(get(dungeonVisibleDoorsAtom), doors);
    set(dungeonVisibleDoorsAtom, newDoors);
  }
);
