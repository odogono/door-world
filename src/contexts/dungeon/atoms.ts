import {
  type Door,
  type DungeonData,
  type Room,
  type RoomId,
  type StrategyType
} from '@model/dungeon';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const dungeonAtom = atomWithStorage<DungeonData | null>('dungeon', null);

export const dungeonSeedAtom = atomWithStorage<number>('dungeonSeed', 1974);

export const dungeonStrategyAtom = atomWithStorage<StrategyType>(
  'dungeonStrategy',
  'random'
);

export const dungeonCurrentRoomAtom = atomWithStorage<RoomId>('dungeonRoom', 1);

export const dungeonVisibleRoomsAtom = atom<Room[]>([]);
export const dungeonVisibleDoorsAtom = atom<Door[]>([]);

// export const useDungeonCurrentRoom = () => {
//   const dungeon = useAtomValue(dungeonAtom);
//   const [roomId, setRoomId] = useAtom(dungeonCurrentRoomAtom);

//   const currentRoom = getDungeonRoomById(dungeon, roomId);

//   return {
//     currentRoom,
//     dungeon,
//     roomId,
//     setRoomId
//   };
// };

// type OpenDungeonDoorProps = {
//   action?: (isOpen: boolean) => Promise<boolean>;
//   doorId: string;
//   open?: boolean;
// };

// const openDungeonDoorAtom = atom(
//   null,
//   async (get, set, props: OpenDungeonDoorProps) => {
//     const { action, doorId, open = true } = props;

//     const dungeon: DungeonData | null = get(dungeonAtom);
//     if (!dungeon) {
//       return;
//     }

//     const update = {
//       ...dungeon,
//       doors: dungeon.doors.map(door =>
//         door.id === doorId ? { ...door, isOpen: open } : door
//       )
//     } as DungeonData;

//     if (action) {
//       await action(open);
//     }

//     set(dungeonAtom, update);

//     // action succeeded
//     return true;
//   }
// );

// export const useDungeonOpenDoorAtom = () => useSetAtom(openDungeonDoorAtom);
