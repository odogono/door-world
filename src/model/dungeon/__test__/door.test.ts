import { describe, expect, test } from 'bun:test';
import { getRoomDoorsExcluding } from '../door';
import { Door, DungeonData, Room, RoomType } from '../types';

const createMockRoom = (id: number): Room => ({
  area: { height: 10, width: 10, x: 0, y: 0 },
  id,
  type: RoomType.NORMAL
});

const createMockDoor = (id: string, room1: number, room2: number): Door => ({
  dir: 'NORTH',
  id,
  position: { x: 0, y: 0 },
  room1,
  room2
});

const createMockDungeon = (doors: Door[]): DungeonData => ({
  doors,
  idInc: 1,
  maxDepth: 1,
  rooms: [],
  seed: 1
});

describe('getRoomDoorsExcluding', () => {
  test('should return empty array when dungeon is null', () => {
    const result = getRoomDoorsExcluding(null, 1, createMockRoom(2).id);
    expect(result).toEqual([]);
  });

  test('should return all doors connected to the room when excludeRoom is null', () => {
    const room1 = createMockRoom(1);

    const doors = [createMockDoor('d1', 1, 2), createMockDoor('d2', 1, 3)];

    const dungeon = createMockDungeon(doors);
    const result = getRoomDoorsExcluding(dungeon, room1.id);
    // console.debug('result', result);
    expect(result).toEqual(doors);
  });

  test('should exclude doors connected to the excludeRoom', () => {
    const room1 = createMockRoom(1);
    const room2 = createMockRoom(2);
    const room3 = createMockRoom(3);

    const doors = [
      createMockDoor('d1', 1, 2),
      createMockDoor('d2', 1, 3),
      createMockDoor('d3', 2, 3)
    ];

    const dungeon = createMockDungeon(doors);
    const result = getRoomDoorsExcluding(dungeon, room1.id, room2.id);
    expect(result).toEqual([doors[1]]); // Only door connecting room1 to room3
  });

  test('should handle doors where the room is either room1 or room2', () => {
    const room1 = createMockRoom(1);
    const room2 = createMockRoom(2);
    const room3 = createMockRoom(3);

    const doors = [
      createMockDoor('d1', 1, 2),
      createMockDoor('d2', 3, 1),
      createMockDoor('d3', 2, 3)
    ];

    const dungeon = createMockDungeon(doors);
    const result = getRoomDoorsExcluding(dungeon, room1.id, room2.id);
    expect(result).toEqual([doors[1]]); // Only door connecting room3 to room1
  });
});
