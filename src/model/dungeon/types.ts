export type RoomId = number;
export type DoorId = string;

export interface Position {
  x: number;
  y: number;
}
export interface Size {
  height: number;
  width: number;
}
export interface Area {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface Entity {
  id: string | number;
}

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
  // text to display on the ground
  floorText?: string;
  floorType?: FloorType;
  id: RoomId;
  isCentral?: boolean;
  parent?: Room;
  type: RoomType;
}

export interface Door {
  dir: CompassDirection;
  id: DoorId;
  isOpen?: boolean;
  position: Position;
  room1: RoomId;
  room2: RoomId;
}

export enum RoomType {
  LARGE = 'large',
  NORMAL = 'normal',
  SMALL = 'small'
}

export const FloorType = {
  SOLID: 'solid',
  TRANSPARENT: 'transparent'
} as const;

export type FloorType = (typeof FloorType)[keyof typeof FloorType];

export type RoomSizeRange = [number, number];

// Room generation strategy interface
export interface RoomGenerationStrategy {
  selectTargetRoom(dungeon: DungeonData, rooms: Room[]): Room;
}

export type StrategyType = 'random' | 'growth' | 'type' | 'branch' | 'simple';

export type CompassDirection = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export type DoorDirection = 'NORTH_SOUTH' | 'EAST_WEST';

export const isPosition = (value: unknown): value is Position =>
  typeof value === 'object' &&
  value !== null &&
  !('z' in value) &&
  'x' in value &&
  'y' in value;
