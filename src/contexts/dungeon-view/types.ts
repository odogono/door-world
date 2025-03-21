export type DungeonViewMode = '2d' | '3d';

export interface DungeonViewContextType {
  dungeonView: DungeonViewMode;
  toggleDungeonView: () => void;
}
