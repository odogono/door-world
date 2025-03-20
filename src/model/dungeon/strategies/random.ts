import { prngIntRange } from '@helpers/random';
import { DungeonData, Room, RoomGenerationStrategy } from '../types';

// Random strategy
export class RandomStrategy implements RoomGenerationStrategy {
  selectTargetRoom(dungeon: DungeonData, rooms: Room[]): Room {
    const [seed, index] = prngIntRange(dungeon.seed, 0, rooms.length - 1);
    dungeon.seed = seed;

    return rooms[index];
  }

  shouldContinueGeneration(
    attempts: number,
    maxAttempts: number,
    roomsGenerated: number,
    maxRooms: number,
    consecutiveFailures: number,
    maxConsecutiveFailures: number
  ): boolean {
    return (
      attempts < maxAttempts &&
      roomsGenerated < maxRooms &&
      consecutiveFailures < maxConsecutiveFailures
    );
  }
}
