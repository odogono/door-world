import { createLog } from '@helpers/log';
import {
  DungeonData,
  generateDungeon,
  generateRoomsAround as generateRoomsAroundHelper
} from '@model/dungeon';
import { StrategyType } from '@model/dungeon/types';
import { useCallback, useEffect, useState } from 'react';
import { DungeonContext } from './context';
import type {
  GenerateRoomsAroundProps,
  GenerateRoomsOptions,
  RegenerateDungeonOptions
} from './types';

const log = createLog('DungeonProvider');

export const DungeonProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [dungeon, setDungeon] = useState<DungeonData | null>(null);
  const [generationProgress, setGenerationProgress] = useState(100);

  const regenerate = useCallback(async (options: RegenerateDungeonOptions) => {
    const {
      maxRooms = 50,
      seed = Math.floor(Math.random() * 1_000_000),
      strategy = 'random'
    } = options;

    setGenerationProgress(0);

    const result = await generateDungeon({
      maxAttempts: maxRooms * 2,
      maxRooms,
      onProgress: intermediateDungeon => {
        // Calculate progress based on room count
        const progress = Math.min(
          100,
          (intermediateDungeon.rooms.length / maxRooms) * 100
        );
        setGenerationProgress(progress);

        // log.debug('Dungeon generation progress', {
        //   progress,
        //   rooms: intermediateDungeon.rooms.length
        // });

        setDungeon(intermediateDungeon);
      },
      seed,
      strategy
    });

    setGenerationProgress(100);
    setDungeon(result);
  }, []);

  const generateRooms = useCallback(
    async (options: GenerateRoomsOptions) => {
      if (!dungeon) {
        throw new Error('No dungeon exists. Call regenerate first.');
      }

      const {
        roomCount = 10,
        maxAttempts = roomCount * 2,
        onProgress
      } = options;

      const result = await generateDungeon({
        dungeon,
        maxAttempts,
        maxRooms: dungeon.rooms.length + roomCount,
        onProgress,
        seed: dungeon.seed,
        strategy:
          (dungeon.strategy?.constructor.name.toLowerCase() as StrategyType) ??
          'random'
      });

      setDungeon(result);
    },
    [dungeon]
  );

  const generateRoomsAround = useCallback(
    async ({ recurseCount = 1, room }: GenerateRoomsAroundProps) => {
      if (!dungeon) {
        throw new Error('No dungeon exists. Call regenerate first.');
      }
      const result = generateRoomsAroundHelper({
        dungeon,
        recurseCount,
        targetRoom: room
      });

      setDungeon(result);
    },
    [dungeon]
  );

  useEffect(() => {
    regenerate({
      maxRooms: 5,
      seed: 1,
      strategy: 'random'
    });
  }, [regenerate]);

  // log.debug('Dungeon generated', {
  //   progress: generationProgress,
  //   rooms: dungeon?.rooms.length
  // });

  return (
    <DungeonContext.Provider
      value={{
        dungeon,
        generateRooms,
        generateRoomsAround,
        generationProgress,
        isGenerating: generationProgress < 100,
        regenerate
      }}
    >
      {children}
    </DungeonContext.Provider>
  );
};
