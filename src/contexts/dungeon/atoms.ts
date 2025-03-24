import type { DungeonData, RoomId, StrategyType } from '@model/dungeon';
import { getDungeonRoomById } from '@model/dungeon/helpers';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const dungeonAtom = atomWithStorage<DungeonData | null>('dungeon', null);

export const dungeonSeedAtom = atomWithStorage<number>('dungeonSeed', 1974);

export const dungeonStrategyAtom = atomWithStorage<StrategyType>(
  'dungeonStrategy',
  'random'
);

export const dungeonCurrentRoomAtom = atomWithStorage<RoomId>('dungeonRoom', 1);

export const useDungeonSeed = () => {
  const [seed, setSeed] = useAtom(dungeonSeedAtom);

  return {
    seed,
    setSeed
  };
};

export const useDungeonCurrentRoom = () => {
  const dungeon = useAtomValue(dungeonAtom);
  const [roomId, setRoomId] = useAtom(dungeonCurrentRoomAtom);

  const currentRoom = getDungeonRoomById(dungeon, roomId);

  return {
    currentRoom,
    dungeon,
    roomId,
    setRoomId
  };
};

export const useDungeonAtom = () => {
  const [dungeon, setDungeon] = useAtom(dungeonAtom);

  return {
    dungeon,
    setDungeon
  };
};

type OpenDungeonDoorProps = {
  action?: (isOpen: boolean) => Promise<boolean>;
  doorId: string;
  open?: boolean;
};

const openDungeonDoorAtom = atom(
  null,
  async (get, set, props: OpenDungeonDoorProps) => {
    const { action, doorId, open = true } = props;

    const dungeon: DungeonData | null = get(dungeonAtom);
    if (!dungeon) {
      return;
    }

    const update = {
      ...dungeon,
      doors: dungeon.doors.map(door =>
        door.id === doorId ? { ...door, isOpen: open } : door
      )
    } as DungeonData;

    if (action) {
      await action(open);
    }

    set(dungeonAtom, update);

    // action succeeded
    return true;
  }
);

export const useDungeonOpenDoorAtom = () => useSetAtom(openDungeonDoorAtom);
