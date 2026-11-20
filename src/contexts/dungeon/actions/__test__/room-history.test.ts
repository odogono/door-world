import { describe, expect, test } from 'bun:test';
import { createStore } from 'jotai';
import type { Door, DungeonData, Room } from '../../../../model/dungeon';
import { RoomType } from '../../../../model/dungeon';
import {
  currentRoomAtom,
  dungeonAtom,
  nextRoomAtom,
  seedAtom
} from '../../atoms';
import { addVisitedRoomAtom, applyNextRoomAtom } from '../room-history';

const room = (id: number): Room => ({
  area: { height: 10, width: 10, x: id * 10, y: 0 },
  id,
  type: RoomType.NORMAL
});

const door = (room2: number): Door => ({
  dir: 'EAST',
  id: `1-${room2}`,
  position: { x: 0, y: 0 },
  room1: 1,
  room2
});

// One central Room with a Door to each of four others
const dungeon: DungeonData = {
  doors: [2, 3, 4, 5].map(door),
  idInc: 6,
  maxDepth: 1,
  rooms: [1, 2, 3, 4, 5].map(room),
  seed: 1974
};

describe('applyNextRoomAtom', () => {
  test('leaves the Seed alone while the Journey picks Doors', () => {
    const store = createStore();
    store.set(seedAtom, 1974);
    store.set(dungeonAtom, dungeon);
    store.set(currentRoomAtom, 1);
    store.set(addVisitedRoomAtom, 1);

    const picked: (number | null)[] = [];
    for (let step = 0; step < 4; step++) {
      store.set(applyNextRoomAtom);
      const next = store.get(nextRoomAtom);
      picked.push(next);
      if (next !== null) {
        store.set(addVisitedRoomAtom, next);
      }
    }

    expect(store.get(seedAtom)).toBe(1974);
    expect(picked.toSorted()).toEqual([2, 3, 4, 5]);
  });
});
