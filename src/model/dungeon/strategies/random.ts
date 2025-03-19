import { PRNG } from '@helpers/random';
import { Room, RoomGenerationStrategy } from '../types';

// Random strategy
export class RandomStrategy implements RoomGenerationStrategy {
  selectTargetRoom(rooms: Room[], prng: PRNG): Room {
    return rooms[prng.nextInt(0, rooms.length - 1)];
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
