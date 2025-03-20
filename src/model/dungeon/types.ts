export interface DungeonData {
  rooms: Room[];
  doors: Door[];
  strategy?: RoomGenerationStrategy | undefined;
  seed: number;
  maxDepth: number;
}

export interface Room {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: RoomType;
  isCentral?: boolean;
  allowedEdges?: ('NORTH' | 'EAST' | 'SOUTH' | 'WEST')[];
  parent?: Room; // Reference to parent room
  depth?: number; // Distance from central room
}

export interface Door {
  room1: Room;
  room2: Room;
  position: { x: number; y: number };
  width: number;
  height: number;
}

export enum RoomType {
  NORMAL = 'normal',
  LARGE = 'large',
  SMALL = 'small'
}

export type RoomSizeRange = [number, number];

// Room generation strategy interface
export interface RoomGenerationStrategy {
  selectTargetRoom(dungeon: DungeonData, rooms: Room[]): Room;
  shouldContinueGeneration(
    attempts: number,
    maxAttempts: number,
    roomsGenerated: number,
    maxRooms: number,
    consecutiveFailures: number,
    maxConsecutiveFailures: number
  ): boolean;
}

export type StrategyType = 'random' | 'growth' | 'type' | 'branch';
