import { findDoors } from './door';
import { generateRoomAround, getMaxRoomDepth } from './room';
import { DungeonData, Room } from './types';

interface GenerateRoomsAroundProps {
  dungeon: DungeonData;
  maxAttempts?: number;
  maxConsecutiveFailures?: number;
  recurseCount?: number;
  roomCount: number;
  targetRoom: Room;
}

export const generateRoomsAround = ({
  dungeon,
  maxAttempts = 20,
  maxConsecutiveFailures = 10,
  recurseCount = 1,
  roomCount,
  targetRoom
}: GenerateRoomsAroundProps): DungeonData => {
  // const dungeonPrng = new PRNG(dungeon.seed);
  const rooms = [...dungeon.rooms];
  let roomsGenerated = 0;

  // if (!dungeon.strategy) {
  //   throw new Error('Strategy is required');
  // }

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
        levelAttempts < maxAttempts &&
        levelRoomsGenerated < roomCount &&
        levelConsecutiveFailures < maxConsecutiveFailures
      ) {
        levelAttempts++;
        const newRoom = generateRoomAround(dungeon, currentRoom, rooms);

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
    ...dungeon,
    doors: findDoors(dungeon, rooms),
    maxDepth: getMaxRoomDepth(rooms),
    rooms
  };
};
