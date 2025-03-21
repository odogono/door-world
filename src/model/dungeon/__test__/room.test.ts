import { describe, expect, test } from 'bun:test';
import {
  generateRoomAround,
  getDistanceBetweenRooms,
  getMaxRoomDepth,
  getRoomCenter,
  getRoomSizeForType,
  isPointInRoom,
  roomsOverlap,
  roomsTouch
} from '../room';
import { DungeonData, Room, RoomType } from '../types';

describe('room functions', () => {
  describe('getMaxRoomDepth', () => {
    test('returns 0 for empty rooms array', () => {
      expect(getMaxRoomDepth([])).toBe(0);
    });

    test('returns max depth from rooms', () => {
      const rooms: Room[] = [
        {
          area: { height: 1, width: 1, x: 0, y: 0 },
          depth: 1,
          id: 1,
          type: RoomType.NORMAL
        },
        {
          area: { height: 1, width: 1, x: 0, y: 0 },
          depth: 3,
          id: 2,
          type: RoomType.NORMAL
        },
        {
          area: { height: 1, width: 1, x: 0, y: 0 },
          depth: 2,
          id: 3,
          type: RoomType.NORMAL
        }
      ];
      expect(getMaxRoomDepth(rooms)).toBe(3);
    });
  });

  describe('getRoomSizeForType', () => {
    test('returns size within SMALL range', () => {
      const [_, size] = getRoomSizeForType(RoomType.SMALL, 12_345);
      expect(size.width).toBeGreaterThanOrEqual(45);
      expect(size.width).toBeLessThanOrEqual(50);
      expect(size.height).toBeGreaterThanOrEqual(45);
      expect(size.height).toBeLessThanOrEqual(50);
    });

    test('returns size within NORMAL range', () => {
      const [_, size] = getRoomSizeForType(RoomType.NORMAL, 12_345);
      expect(size.width).toBeGreaterThanOrEqual(50);
      expect(size.width).toBeLessThanOrEqual(80);
      expect(size.height).toBeGreaterThanOrEqual(50);
      expect(size.height).toBeLessThanOrEqual(80);
    });

    test('returns size within LARGE range', () => {
      const [_, size] = getRoomSizeForType(RoomType.LARGE, 12_345);
      expect(size.width).toBeGreaterThanOrEqual(80);
      expect(size.width).toBeLessThanOrEqual(120);
      expect(size.height).toBeGreaterThanOrEqual(80);
      expect(size.height).toBeLessThanOrEqual(120);
    });
  });

  describe('roomsOverlap', () => {
    test('detects overlapping rooms', () => {
      const room1: Room = {
        area: { height: 5, width: 5, x: 0, y: 0 },
        id: 1,
        type: RoomType.NORMAL
      };
      const room2: Room = {
        area: { height: 5, width: 5, x: 3, y: 3 },
        id: 2,
        type: RoomType.NORMAL
      };
      expect(roomsOverlap(room1, room2)).toBe(true);
    });

    test('detects non-overlapping rooms', () => {
      const room1: Room = {
        area: { height: 5, width: 5, x: 0, y: 0 },
        id: 1,
        type: RoomType.NORMAL
      };
      const room2: Room = {
        area: { height: 5, width: 5, x: 6, y: 6 },
        id: 2,
        type: RoomType.NORMAL
      };
      expect(roomsOverlap(room1, room2)).toBe(false);
    });
  });

  describe('roomsTouch', () => {
    test('detects horizontally touching rooms', () => {
      const room1: Room = {
        area: { height: 5, width: 5, x: 0, y: 0 },
        id: 1,
        type: RoomType.NORMAL
      };
      const room2: Room = {
        area: { height: 5, width: 5, x: 5, y: 0 },
        id: 2,
        type: RoomType.NORMAL
      };
      expect(roomsTouch(room1, room2)).toBe(true);
    });

    test('detects vertically touching rooms', () => {
      const room1: Room = {
        area: { height: 5, width: 5, x: 0, y: 0 },
        id: 1,
        type: RoomType.NORMAL
      };
      const room2: Room = {
        area: { height: 5, width: 5, x: 0, y: 5 },
        id: 2,
        type: RoomType.NORMAL
      };
      expect(roomsTouch(room1, room2)).toBe(true);
    });

    test('returns false for non-touching rooms', () => {
      const room1: Room = {
        area: { height: 5, width: 5, x: 0, y: 0 },
        id: 1,
        type: RoomType.NORMAL
      };
      const room2: Room = {
        area: { height: 5, width: 5, x: 6, y: 6 },
        id: 2,
        type: RoomType.NORMAL
      };
      expect(roomsTouch(room1, room2)).toBe(false);
    });
  });

  describe('getRoomCenter', () => {
    const dungeon: DungeonData = {
      doors: [],
      idInc: 2,
      maxDepth: 0,
      rooms: [
        {
          area: { height: 4, width: 6, x: 0, y: 0 },
          id: 1,
          type: RoomType.NORMAL
        }
      ],
      seed: 12_345
    };

    test('returns center point of room', () => {
      const center = getRoomCenter(dungeon, dungeon.rooms[0]);
      expect(center).toEqual({ x: 3, y: 2 });
    });

    test('returns center point when using room id', () => {
      const center = getRoomCenter(dungeon, 1);
      expect(center).toEqual({ x: 3, y: 2 });
    });

    test('throws error for non-existent room', () => {
      expect(() => getRoomCenter(dungeon, 999)).toThrow();
    });
  });

  describe('getDistanceBetweenRooms', () => {
    const dungeon: DungeonData = {
      doors: [],
      idInc: 3,
      maxDepth: 0,
      rooms: [
        {
          area: { height: 2, width: 2, x: 0, y: 0 },
          id: 1,
          type: RoomType.NORMAL
        },
        {
          area: { height: 2, width: 2, x: 3, y: 4 },
          id: 2,
          type: RoomType.NORMAL
        }
      ],
      seed: 12_345
    };

    test('calculates distance between room centers', () => {
      const distance = getDistanceBetweenRooms(dungeon, 1, 2);
      expect(distance).toBeCloseTo(5);
    });
  });

  describe('isPointInRoom', () => {
    const room: Room = {
      area: { height: 5, width: 5, x: 0, y: 0 },
      id: 1,
      type: RoomType.NORMAL
    };

    test('returns true for point inside room', () => {
      expect(isPointInRoom({ x: 2, y: 2 }, room)).toBe(true);
    });

    test('returns true for point on room edge', () => {
      expect(isPointInRoom({ x: 0, y: 0 }, room)).toBe(true);
      expect(isPointInRoom({ x: 5, y: 5 }, room)).toBe(true);
    });

    test('returns false for point outside room', () => {
      expect(isPointInRoom({ x: 6, y: 6 }, room)).toBe(false);
    });
  });

  describe('generateRoomAround', () => {
    const dungeon: DungeonData = {
      doors: [],
      idInc: 1,
      maxDepth: 0,
      rooms: [],
      seed: 12_345
    };

    const targetRoom: Room = {
      area: { height: 5, width: 5, x: 5, y: 5 },
      depth: 0,
      id: 1,
      type: RoomType.NORMAL
    };

    test('generates valid room adjacent to target', () => {
      const newRoom = generateRoomAround(dungeon, targetRoom, []);
      expect(newRoom).not.toBeNull();
      if (newRoom) {
        expect(roomsTouch(targetRoom, newRoom)).toBe(true);
        expect(newRoom.depth).toBe(1);
        expect(newRoom.parent).toBe(targetRoom);
      }
    });

    test('returns null when no valid placement possible', () => {
      const blockingRooms: Room[] = [
        {
          area: { height: 5, width: 15, x: 0, y: 0 },
          id: 2,
          type: RoomType.NORMAL
        },
        {
          area: { height: 5, width: 15, x: 0, y: 10 },
          id: 3,
          type: RoomType.NORMAL
        },
        {
          area: { height: 15, width: 5, x: 0, y: 0 },
          id: 4,
          type: RoomType.NORMAL
        },
        {
          area: { height: 15, width: 5, x: 10, y: 0 },
          id: 5,
          type: RoomType.NORMAL
        }
      ];

      const result = generateRoomAround(dungeon, targetRoom, blockingRooms);
      expect(result).toBeNull();
    });
  });
});
