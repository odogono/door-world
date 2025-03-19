import { PRNG } from '@helpers/random';
import { CANVAS_SIZE } from './constants';
import { Room, RoomGenerationStrategy } from './types';

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

  selectTargetRoom(rooms: Room[], prng: PRNG): Room {
    const sortedRooms = [...rooms].sort(
      (a, b) => this.getRoomGrowthScore(b) - this.getRoomGrowthScore(a)
    );

    const candidates = sortedRooms.slice(0, Math.min(5, sortedRooms.length));
    return candidates[prng.nextInt(0, candidates.length - 1)];
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

// Room type strategy
export class RoomTypeStrategy implements RoomGenerationStrategy {
  private getRoomDensity(room: Room, allRooms: Room[]): number {
    const radius = 150;
    let nearbyRooms = 0;

    for (const otherRoom of allRooms) {
      if (otherRoom === room) continue;

      const distance = this.getDistanceBetweenRooms(room, otherRoom);
      if (distance < radius) {
        nearbyRooms++;
      }
    }

    return nearbyRooms;
  }

  private getDistanceBetweenRooms(room1: Room, room2: Room): number {
    const center1 = this.getRoomCenter(room1);
    const center2 = this.getRoomCenter(room2);
    return Math.sqrt(
      Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
    );
  }

  private getRoomCenter(room: Room): { x: number; y: number } {
    return {
      x: room.x + room.width / 2,
      y: room.y + room.height / 2
    };
  }

  private getRoomTypeScore(room: Room, allRooms: Room[]): number {
    const density = this.getRoomDensity(room, allRooms);
    const center = CANVAS_SIZE / 2;
    const roomCenterX = room.x + room.width / 2;
    const roomCenterY = room.y + room.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(roomCenterX - center, 2) + Math.pow(roomCenterY - center, 2)
    );

    const densityScore = Math.max(0, 5 - density);
    const centerScore = Math.max(0, distanceFromCenter - 200);
    const combinedScore = densityScore * 2 + centerScore * 0.5;

    return combinedScore;
  }

  selectTargetRoom(rooms: Room[], prng: PRNG): Room {
    const sortedRooms = [...rooms].sort(
      (a, b) =>
        this.getRoomTypeScore(b, rooms) - this.getRoomTypeScore(a, rooms)
    );

    const candidates = sortedRooms.slice(0, Math.min(5, sortedRooms.length));
    return candidates[prng.nextInt(0, candidates.length - 1)];
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

// Branching strategy
export class BranchingStrategy implements RoomGenerationStrategy {
  private getBranchScore(room: Room, allRooms: Room[]): number {
    const depth = room.depth || 0;
    const maxDepth = 5;
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
      if (otherRoom === room || otherRoom.parent === room.parent) continue;

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

  selectTargetRoom(rooms: Room[], prng: PRNG): Room {
    const sortedRooms = [...rooms].sort(
      (a, b) => this.getBranchScore(b, rooms) - this.getBranchScore(a, rooms)
    );

    const candidates = sortedRooms.slice(0, Math.min(5, sortedRooms.length));
    return candidates[prng.nextInt(0, candidates.length - 1)];
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

// Strategy factory
export const createStrategy = (
  type: 'random' | 'growth' | 'type' | 'branch'
): RoomGenerationStrategy => {
  switch (type) {
    case 'growth':
      return new GrowthDirectionStrategy();
    case 'type':
      return new RoomTypeStrategy();
    case 'branch':
      return new BranchingStrategy();
    case 'random':
    default:
      return new RandomStrategy();
  }
};
