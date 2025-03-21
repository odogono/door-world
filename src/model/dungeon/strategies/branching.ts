import { prngIntRange } from '@helpers/random';
import { DungeonData, Room, RoomGenerationStrategy } from '../types';

// Branching strategy
export class BranchingStrategy implements RoomGenerationStrategy {
  private getBranchScore(room: Room, allRooms: Room[]): number {
    const depth = room.depth || 0;
    const idealDepth = 3;

    const depthScore = Math.max(0, 1 - Math.abs(depth - idealDepth));
    const childrenCount = this.getChildrenCount(room, allRooms);
    const spacingScore = this.getSpacingScore(room, allRooms);

    const combinedScore =
      depthScore * 2 + (1 - childrenCount / 4) * 3 + spacingScore;

    return combinedScore;
  }

  private getChildrenCount(room: Room, allRooms: Room[]): number {
    return allRooms.filter(r => r.parent === room).length;
  }

  private getSpacingScore(room: Room, allRooms: Room[]): number {
    let minDistance = Infinity;
    const center = this.getRoomCenter(room);

    for (const otherRoom of allRooms) {
      if (otherRoom === room || otherRoom.parent === room.parent) {
        continue;
      }

      const otherCenter = this.getRoomCenter(otherRoom);
      const distance = Math.sqrt(
        Math.pow(otherCenter.x - center.x, 2) +
          Math.pow(otherCenter.y - center.y, 2)
      );

      minDistance = Math.min(minDistance, distance);
    }

    return Math.min(1, minDistance / 200);
  }

  private getRoomCenter(room: Room): { x: number; y: number } {
    return {
      x: room.x + room.width / 2,
      y: room.y + room.height / 2
    };
  }

  selectTargetRoom(dungeon: DungeonData, rooms: Room[]): Room {
    const sortedRooms = [...rooms].sort(
      (a, b) => this.getBranchScore(b, rooms) - this.getBranchScore(a, rooms)
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
