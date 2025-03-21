import { createLog } from '@helpers/log';
import { findDoors } from './door';
import { createDungeon } from './helpers';
import { generateRoomAround, getMaxRoomDepth } from './room';
import { createStrategy } from './strategies';
import { DungeonData, Room, RoomType, StrategyType } from './types';

const log = createLog('Dungeon');

export * from './types';
export * from './constants';
export * from './strategies';
export * from './room';
export * from './door';

type GenerateDungeonOptions = {
  dungeon?: DungeonData;
  maxAttempts: number;
  maxRooms: number;
  onProgress?: (dungeon: DungeonData) => void;
  seed: number;
  strategy: StrategyType;
};

export const generateDungeon = async (
  props: GenerateDungeonOptions
): Promise<DungeonData> => {
  const { dungeon, seed } = props;

  if (!dungeon) {
    const dungeon = createDungeon(seed);

    // Create central room at world center
    const centralRoom: Room = {
      allowedEdges: ['NORTH'],
      area: { height: 100, width: 100, x: -50, y: -50 },
      depth: 0,
      id: 1,
      isCentral: true,
      type: RoomType.NORMAL
    };
    dungeon.rooms.push(centralRoom);

    props = { ...props, dungeon };
  }

  return generateDungeonAsync(props);
};

// Generator function for dungeon generation
export function* generateDungeonGenerator(
  props: GenerateDungeonOptions
): Generator<DungeonData, DungeonData> {
  const { dungeon, maxAttempts, maxRooms, seed, strategy } = props;

  if (!dungeon) {
    throw new Error('Dungeon is required');
  }

  log.debug('Generating dungeon', { maxRooms, seed, strategy });

  // const dungeonPrng = new PRNG(seed);
  const rooms = [...dungeon.rooms];
  const generationStrategy = createStrategy(strategy);

  // Generate multiple rooms around the central room
  let attempts = 0;
  let roomsGenerated = 0;
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 50;

  while (
    attempts < maxAttempts &&
    roomsGenerated < maxRooms &&
    consecutiveFailures < maxConsecutiveFailures
  ) {
    const targetRoom = generationStrategy.selectTargetRoom(dungeon, rooms);
    const newRoom = generateRoomAround(dungeon, targetRoom, rooms);

    if (newRoom) {
      rooms.push(newRoom);
      roomsGenerated++;
      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
      if (consecutiveFailures >= maxConsecutiveFailures) {
        break;
      }
    }

    attempts++;
    if (attempts >= maxAttempts) {
      break;
    }

    // Yield intermediate state every few rooms
    if (roomsGenerated % 5 === 0) {
      yield {
        ...dungeon,
        doors: findDoors(rooms),
        maxDepth: getMaxRoomDepth(rooms),
        rooms: [...rooms],
        strategy
      };
    }
  }

  // Final yield with complete dungeon
  return {
    ...dungeon,
    doors: findDoors(rooms),
    maxDepth: getMaxRoomDepth(rooms),
    rooms,
    strategy
  };
}

// Async wrapper for the generator
export const generateDungeonAsync = async (
  props: GenerateDungeonOptions
): Promise<DungeonData> => {
  const { onProgress } = props;
  const generator = generateDungeonGenerator(props);
  let result: DungeonData;

  while (true) {
    const { done, value } = generator.next();
    if (done) {
      result = value;
      break;
    }
    if (onProgress) {
      onProgress(value);
    }
    // Allow other tasks to run
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return result;
};
