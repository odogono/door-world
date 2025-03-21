import { RoomGenerationStrategy, StrategyType } from '../types';
import { BranchingStrategy } from './branching';
import { GrowthDirectionStrategy } from './growth';
import { RandomStrategy } from './random';
import { RoomTypeStrategy } from './room';
import { SimpleStrategy } from './simple';

// Strategy factory
export const createStrategy = (type: StrategyType): RoomGenerationStrategy => {
  switch (type) {
    case 'growth':
      return new GrowthDirectionStrategy();
    case 'type':
      return new RoomTypeStrategy();
    case 'branch':
      return new BranchingStrategy();
    case 'simple':
      return new SimpleStrategy();
    case 'random':
    default:
      return new RandomStrategy();
  }
};
