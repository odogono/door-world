import { prngIntRange } from '@helpers/random';
import { CANVAS_SIZE } from '../constants';
import { DungeonData, Room, RoomGenerationStrategy } from '../types';

// Growth direction strategy
export class GrowthDirectionStrategy implements RoomGenerationStrategy {
  private getRoomFrontier(room: Room): number {
    const distanceToLeft = room.x;
    const distanceToRight = CANVAS_SIZE - (room.x + room.width);
    const distanceToTop = room.y;
    const distanceToBottom = CANVAS_SIZE - (room.y + room.height);

    return Math.min(
      distanceToLeft,
      distanceToRight,
      distanceToTop,
      distanceToBottom
    );
  }

  private getRoomGrowthScore(room: Room): number {
    const frontier = this.getRoomFrontier(room);
    const center = CANVAS_SIZE / 2;
    const roomCenterX = room.x + room.width / 2;
    const roomCenterY = room.y + room.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(roomCenterX - center, 2) + Math.pow(roomCenterY - center, 2)
    );

    const edgeScore = Math.max(0, 100 - frontier);
    const centerScore = Math.max(0, distanceFromCenter - 200);
    const combinedScore = edgeScore + centerScore * 0.5;

    return combinedScore;
  }

  selectTargetRoom(dungeon: DungeonData, rooms: Room[]): Room {
    const sortedRooms = [...rooms].sort(
      (a, b) => this.getRoomGrowthScore(b) - this.getRoomGrowthScore(a)
    );

    const candidates = sortedRooms.slice(0, Math.min(5, sortedRooms.length));

    const [seed, index] = prngIntRange(dungeon.seed, 0, candidates.length - 1);
    dungeon.seed = seed;

    return candidates[index];
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
