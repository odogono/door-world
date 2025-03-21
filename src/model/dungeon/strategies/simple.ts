import { DungeonData, Room, RoomGenerationStrategy } from '../types';

// Simple strategy
export class SimpleStrategy implements RoomGenerationStrategy {
  selectTargetRoom(dungeon: DungeonData, rooms: Room[]): Room {
    return rooms[0];
  }
}
