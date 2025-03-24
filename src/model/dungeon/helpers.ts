import { randomUnsignedInt } from '@helpers/random';
import { Door, DungeonData, Room, RoomId } from './types';

export const generateRoomId = (dungeon: DungeonData) => {
  return dungeon.idInc++;
};

export const createDungeon = (
  seed: number = randomUnsignedInt(0, 1_000_000)
): DungeonData => {
  return {
    doors: [],
    idInc: 10,
    maxDepth: 0,
    rooms: [],
    seed
  };
};

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

// export const updateDungeonDoor = (
//   dungeon: DungeonData | null,
//   doorId: string,
//   open: boolean
// ) => {
//   if (!dungeon) {
//     return null;
//   }

//   return {
//     ...dungeon,
//     doors: dungeon.doors.map(door =>
//       door.id === doorId ? { ...door, isOpen: open } : door
//     )
//   } as DungeonData;
// };
