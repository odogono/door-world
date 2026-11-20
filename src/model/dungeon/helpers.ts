import { randomUnsignedInt } from '../../helpers/random';
import type { Door, DungeonData, Room, RoomId } from './types';

export const generateRoomId = (dungeon: DungeonData) => dungeon.idInc++;

export const createDungeon = (
  seed: number = randomUnsignedInt(0, 1_000_000)
): DungeonData => ({
  doors: [],
  idInc: 10,
  maxDepth: 0,
  rooms: [],
  seed
});

export const getDungeonRoomById = (
  dungeon?: DungeonData | null,
  id?: number
): Room | undefined => {
  if (!dungeon || !id) {
    return undefined;
  }

  return dungeon.rooms.find(room => room.id === id);
};

export const getDungeonDoorById = (
  dungeon?: DungeonData | null,
  id?: string
): Door | undefined => {
  if (!dungeon || !id) {
    return undefined;
  }

  return dungeon.doors.find(door => door.id === id);
};

export const getDungeonConnectingRoom = (
  dungeon: DungeonData | null,
  roomId: RoomId,
  door: Door
) => {
  if (!dungeon) {
    return null;
  }

  const nextRoomId = door.room1 === roomId ? door.room2 : door.room1;

  return getDungeonRoomById(dungeon, nextRoomId);
};

export const updateDungeonDoorState = (
  dungeon: DungeonData | null,
  doorId: string,
  isOpen: boolean
): DungeonData | null => {
  if (!dungeon) {
    return null;
  }

  return {
    ...dungeon,
    doors: dungeon.doors.map(door =>
      door.id === doorId ? { ...door, isOpen } : door
    )
  };
};

/**
 * Get all the rooms connected to a given room
 * @param dungeon
 * @param roomId
 * @returns
 */
export const getDungeonConnectedRooms = (
  dungeon: DungeonData | null,
  roomId: RoomId
): RoomId[] => {
  if (!dungeon) {
    return [];
  }

  return dungeon.doors
    .filter(door => door.room1 === roomId || door.room2 === roomId)
    .map(door => (door.room1 === roomId ? door.room2 : door.room1));
};
