import { PRNG } from '@helpers/random';
import { MAX_ROOMS, NUM_ROOMS_PER_CLICK, WORLD_SIZE } from './constants';
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

  // Create central room at world center
  const centralRoom: Room = {
    x: -50, // Center the room at (0,0)
    y: -50,
    width: 100,
    height: 100,
    type: RoomType.NORMAL,
    isCentral: true,
    allowedEdges: ['NORTH'],
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
  }

  return {
    rooms,
    doors: findDoors(rooms),
    strategy: generationStrategy,
    seed: dungeonPrng.getSeed(),
    maxDepth: getMaxRoomDepth(rooms)
  };
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
