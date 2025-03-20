export type RoomId = number;

export type Position = { x: number; y: number };
export type Size = { width: number; height: number };
export type Area = { x: number; y: number; width: number; height: number };

export interface DungeonData {
  idInc: number;
  seed: number;
  rooms: Room[];
  doors: Door[];
  strategy?: RoomGenerationStrategy | undefined;
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
  allowedEdges?: CompassDirection[];
  parent?: Room; // Reference to parent room
  depth?: number; // Distance from central room
}

export interface Door {
  room1: RoomId;
  room2: RoomId;
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

export type CompassDirection = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
