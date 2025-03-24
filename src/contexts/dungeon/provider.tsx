import { createLog } from '@helpers/log';
import { generateDungeon } from '@model/dungeon';
import { generateRoomsAround as generateRoomsAroundHelper } from '@model/dungeon/generateRoomsAround';
import { useCallback, useEffect, useState } from 'react';
import { useDungeonAtom, useDungeonSeed } from './atoms';
import { DungeonContext } from './context';
import type {
  GenerateRoomsAroundProps,
  RegenerateDungeonOptions
} from './types';

const log = createLog('DungeonProvider');

export const DungeonProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { dungeon, setDungeon } = useDungeonAtom();
  // const [dungeon, setDungeon] = useState<DungeonData | null>(null);
  const [generationProgress, setGenerationProgress] = useState(100);

  const { seed, setSeed } = useDungeonSeed();

  const regenerate = useCallback(
    async (options: RegenerateDungeonOptions) => {
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

      log.debug('Dungeon regenerated', {
        dungeon: result,
        seed,
        strategy
      });
    },
    [setDungeon]
  );

  const generateRoomsAround = useCallback(
    async ({ recurseCount = 1, room, roomCount }: GenerateRoomsAroundProps) => {
      if (!dungeon) {
        throw new Error('No dungeon exists. Call regenerate first.');
      }
      const result = generateRoomsAroundHelper({
        dungeon,
        recurseCount,
        roomCount,
        targetRoom: room
      });

      setDungeon(result);
    },
    [dungeon, setDungeon]
  );

  useEffect(() => {
    regenerate({
      maxRooms: 5,
      seed,
      strategy: 'random'
    });
  }, [regenerate, seed]);

  // log.debug('Dungeon generated', {
  //   progress: generationProgress,
  //   rooms: dungeon?.rooms.length
  // });

  return (
    <DungeonContext.Provider
      value={{
        dungeon,
        generateRoomsAround,
        generationProgress,
        isGenerating: generationProgress < 100,
        regenerate,
        seed,
        setSeed
      }}
    >
      {children}
    </DungeonContext.Provider>
  );
};
