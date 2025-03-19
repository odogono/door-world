import { PRNG } from '@helpers/random';
import { CANVAS_SIZE } from '../constants';
import { Room, RoomGenerationStrategy } from '../types';

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
