import { createLog } from '@helpers/log';
import { PRNG, randomUnsignedInt } from '@helpers/random';
import { MAX_ROOMS, NUM_ROOMS_PER_CLICK } from './constants';
import { findDoors } from './door';
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
  fillSpace: boolean;
  strategy: StrategyType;
  seed: number;
  onProgress?: (dungeon: DungeonData) => void;
};

export const generateDungeon = async (
  props: GenerateDungeonOptions
): Promise<DungeonData> => {
  const { dungeon, seed } = props;

  if (!dungeon) {
    const dungeon = createDungeonData(seed);

    // Create central room at world center
    const centralRoom: Room = {
      id: 1,
      x: -50, // Center the room at (0,0)
      y: -50,
      width: 100,
      height: 100,
      type: RoomType.NORMAL,
      isCentral: true,
      allowedEdges: ['NORTH'],
      depth: 0
    };
    dungeon.rooms.push(centralRoom);

    props = { ...props, dungeon };
  }

  return generateDungeonAsync(props);
};

export const createDungeonData = (
  seed: number = randomUnsignedInt(0, 1000000)
): DungeonData => {
  return {
    rooms: [],
    doors: [],
    seed,
    maxDepth: 0
  };
};

// Generator function for dungeon generation
export function* generateDungeonGenerator(
  props: GenerateDungeonOptions
): Generator<DungeonData, DungeonData> {
  const { dungeon, seed, fillSpace, strategy } = props;

  if (!dungeon) {
    throw new Error('Dungeon is required');
  }

  log.debug('Generating dungeon', { seed, fillSpace, strategy });

  const dungeonPrng = new PRNG(seed);
  const rooms = [...dungeon.rooms];
  const generationStrategy = createStrategy(strategy);

  // Generate multiple rooms around the central room
  let attempts = 0;
  const maxAttempts = fillSpace ? 1000 : 100;
  let roomsGenerated = 0;
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 50;

  while (
    generationStrategy.shouldContinueGeneration(
      attempts,
      maxAttempts,
      roomsGenerated,
      fillSpace ? MAX_ROOMS : NUM_ROOMS_PER_CLICK,
      consecutiveFailures,
      maxConsecutiveFailures
    )
  ) {
    const targetRoom = generationStrategy.selectTargetRoom(rooms, dungeonPrng);
    const newRoom = generateRoomAround(targetRoom, rooms, dungeonPrng);

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
        rooms: [...rooms],
        doors: findDoors(rooms),
        strategy: generationStrategy,
        seed: dungeonPrng.getSeed(),
        maxDepth: getMaxRoomDepth(rooms)
      };
    }
  }

  // Final yield with complete dungeon
  return {
    ...dungeon,
    rooms,
    doors: findDoors(rooms),
    strategy: generationStrategy,
    seed: dungeonPrng.getSeed(),
    maxDepth: getMaxRoomDepth(rooms)
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
    const { value, done } = generator.next();
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

interface GenerateRoomsAroundProps {
  dungeon: DungeonData;
  targetRoom: Room;
  maxAttempts?: number;
  maxConsecutiveFailures?: number;
  roomCount?: number;
  recurseCount?: number;
}

export const generateRoomsAround = ({
  dungeon,
  targetRoom,
  maxAttempts = 20,
  maxConsecutiveFailures = 10,
  roomCount = NUM_ROOMS_PER_CLICK,
  recurseCount = 1
}: GenerateRoomsAroundProps): DungeonData => {
  const dungeonPrng = new PRNG(dungeon.seed);
  const rooms = [...dungeon.rooms];
  let roomsGenerated = 0;

  if (!dungeon.strategy) {
    throw new Error('Strategy is required');
  }

  // Queue of rooms to process for each recursion level
  const roomQueue: Room[][] = Array(recurseCount)
    .fill(null)
    .map(() => []);
  roomQueue[0].push(targetRoom);

  // Process each recursion level
  for (let level = 0; level < recurseCount; level++) {
    const currentLevelRooms = roomQueue[level];

    // Process each room in the current level
    for (const currentRoom of currentLevelRooms) {
      let levelAttempts = 0;
      let levelRoomsGenerated = 0;
      let levelConsecutiveFailures = 0;

      while (
        dungeon.strategy.shouldContinueGeneration(
          levelAttempts,
          maxAttempts,
          levelRoomsGenerated,
          roomCount,
          levelConsecutiveFailures,
          maxConsecutiveFailures
        )
      ) {
        levelAttempts++;
        const newRoom = generateRoomAround(currentRoom, rooms, dungeonPrng);

        if (newRoom) {
          rooms.push(newRoom);
          roomsGenerated++;
          levelRoomsGenerated++;
          levelConsecutiveFailures = 0;

          // Add new room to next level's queue if we're not at the last level
          if (level < recurseCount - 1) {
            roomQueue[level + 1].push(newRoom);
          }
        } else {
          levelConsecutiveFailures++;
        }
      }
    }
  }

  return {
    rooms,
    doors: findDoors(rooms),
    strategy: dungeon.strategy,
    seed: dungeonPrng.getSeed(),
    maxDepth: getMaxRoomDepth(rooms)
  };
};
