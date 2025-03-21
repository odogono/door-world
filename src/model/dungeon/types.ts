export type RoomId = number;

export type Position = { x: number; y: number };
export type Size = { height: number; width: number };
export type Area = { height: number; width: number; x: number; y: number };

export interface DungeonData {
  doors: Door[];
  idInc: number;
  maxDepth: number;
  rooms: Room[];
  seed: number;
  strategy?: StrategyType;
}

export interface Room {
  allowedEdges?: CompassDirection[];
  area: Area;
  // Reference to parent room
  depth?: number;
  // height: number;
  id: number;
  isCentral?: boolean;
  parent?: Room;
  type: RoomType;
  // width: number;
  // x: number;
  // y: number; // Distance from central room
}

export interface Door {
  // width: number;
  dir: CompassDirection;
  // height: number;
  position: Position;
  room1: RoomId;
  room2: RoomId;
}

export enum RoomType {
  LARGE = 'large',
  NORMAL = 'normal',
  SMALL = 'small'
}

export type RoomSizeRange = [number, number];

// Room generation strategy interface
export interface RoomGenerationStrategy {
  selectTargetRoom(dungeon: DungeonData, rooms: Room[]): Room;
}

export type StrategyType = 'random' | 'growth' | 'type' | 'branch' | 'simple';

export type CompassDirection = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export type DoorDirection = 'NORTH_SOUTH' | 'EAST_WEST';
