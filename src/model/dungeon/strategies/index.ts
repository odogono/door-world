import { RoomGenerationStrategy } from '../types';
import { BranchingStrategy } from './branching';
import { GrowthDirectionStrategy } from './growth';
import { RandomStrategy } from './random';
import { RoomTypeStrategy } from './room';

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
