import { describe, expect, test } from 'bun:test';
import { generateRoomsAround } from '../generateRoomsAround';
import { DungeonData, Room, RoomType } from '../types';

const createMockRoom = (id: number): Room => ({
  area: { height: 10, width: 10, x: 0, y: 0 },
  depth: 0,
  id,
  type: RoomType.NORMAL
});

const createMockDungeon = (): DungeonData => ({
  doors: [],
  idInc: 1,
  maxDepth: 0,
  rooms: [],
  seed: 12_345,
  strategy: 'simple'
});

describe('generateRoomsAround', () => {
  test('should generate rooms around target room', () => {
    const dungeon = createMockDungeon();
    const targetRoom = createMockRoom(1);
    dungeon.rooms.push(targetRoom);

    const result = generateRoomsAround({
      dungeon,
      recurseCount: 1,
      roomCount: 3,
      targetRoom
    });

    expect(result.rooms.length).toBeGreaterThan(1);
    expect(result.doors.length).toBeGreaterThan(0);
    expect(result.maxDepth).toBeGreaterThan(0);
  });

  test('should respect maxAttempts parameter', () => {
    const dungeon = createMockDungeon();
    const targetRoom = createMockRoom(1);
    const roomCount = 3;
    dungeon.rooms.push(targetRoom);

    const result = generateRoomsAround({
      dungeon,
      maxAttempts: 1,
      roomCount,
      targetRoom
    });

    // With very limited attempts, we expect fewer rooms
    expect(result.rooms.length).toBeLessThanOrEqual(roomCount);
  });

  test('should handle recursion correctly', () => {
    const dungeon = createMockDungeon();
    const targetRoom = createMockRoom(1);
    dungeon.rooms.push(targetRoom);

    const result = generateRoomsAround({
      dungeon,
      recurseCount: 3,
      roomCount: 2,
      targetRoom
    });

    // Check that we have rooms at different depths
    const depths = new Set(result.rooms.map(r => r.depth));
    expect(depths.size).toBeGreaterThan(1);
  });

  // test('should throw error when strategy is missing', () => {
  //   const dungeon = createMockDungeon();
  //   const targetRoom = createMockRoom(1);
  //   dungeon.rooms.push(targetRoom);
  //   // Using unknown instead of any for type safety
  //   dungeon.strategy = undefined as unknown as DungeonData['strategy'];

  //   const roomCount = 3;

  //   expect(() =>
  //     generateRoomsAround({
  //       dungeon,
  //       roomCount,
  //       targetRoom
  //     })
  //   ).toThrow('Strategy is required');
  // });

  test('should maintain room connections', () => {
    const dungeon = createMockDungeon();
    const targetRoom = createMockRoom(1);
    dungeon.rooms.push(targetRoom);

    const result = generateRoomsAround({
      dungeon,
      roomCount: 3,
      targetRoom
    });

    // Check that new rooms have the targetRoom as parent
    const newRooms = result.rooms.filter(r => r.id !== targetRoom.id);
    expect(newRooms.some(r => r.parent?.id === targetRoom.id)).toBe(true);
  });
});
