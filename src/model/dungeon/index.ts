import { PRNG } from '@helpers/random';
import { CANVAS_SIZE, NUM_ROOMS_PER_CLICK } from './constants';
import { findDoors } from './door';
import { generateRoomAround, getMaxRoomDepth } from './room';
import { createStrategy } from './strategies';
import { DungeonData, Room, RoomType } from './types';

export * from './types';
export * from './constants';
export * from './strategies';
export * from './room';
export * from './door';

export const generateDungeon = (
  fillSpace: boolean = false,
  strategy: 'random' | 'growth' | 'type' | 'branch' = 'random',
  seed: number = Math.floor(Math.random() * 1000000)
): DungeonData => {
  const dungeonPrng = new PRNG(seed);
  const rooms: Room[] = [];
  const generationStrategy = createStrategy(strategy);

  // Create central room with only TOP edge allowed
  const centralRoom: Room = {
    x: CANVAS_SIZE / 2 - 50,
    y: CANVAS_SIZE / 2 - 50,
    width: 100,
    height: 100,
    type: RoomType.NORMAL,
    isCentral: true,
    allowedEdges: ['TOP'],
    depth: 0
  };
  rooms.push(centralRoom);

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
      fillSpace ? Infinity : NUM_ROOMS_PER_CLICK,
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
  }

  return {
    rooms,
    doors: findDoors(rooms),
    strategy: generationStrategy,
    seed: dungeonPrng.getSeed(),
    maxDepth: getMaxRoomDepth(rooms)
  };
};

export const generateRoomsAround = (
  dungeon: DungeonData,
  targetRoom: Room
): DungeonData => {
  const dungeonPrng = new PRNG(dungeon.seed);
  const rooms = [...dungeon.rooms];
  let attempts = 0;
  let roomsGenerated = 0;
  let consecutiveFailures = 0;
  const maxAttempts = 10;
  const maxConsecutiveFailures = 5;

  while (
    dungeon.strategy.shouldContinueGeneration(
      attempts,
      maxAttempts,
      roomsGenerated,
      NUM_ROOMS_PER_CLICK,
      consecutiveFailures,
      maxConsecutiveFailures
    )
  ) {
    attempts++;
    const newRoom = generateRoomAround(targetRoom, rooms, dungeonPrng);

    if (newRoom) {
      rooms.push(newRoom);
      roomsGenerated++;
      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
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
