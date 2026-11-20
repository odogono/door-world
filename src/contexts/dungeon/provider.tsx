import { useStore } from 'jotai';
import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { createLog } from '../../helpers/log';
import { generateDungeon } from '../../model/dungeon';
import { generateRoomsAround as generateRoomsAroundHelper } from '../../model/dungeon/generateRoomsAround';
import { dungeonAtom, seedAtom } from './atoms';
import { DungeonContext } from './context';
import { useDungeonAtom } from './hooks/use-dungeon';
import { useDungeonSeed } from './hooks/use-dungeon-seed';
import type {
  GenerateRoomsAroundProps,
  RegenerateDungeonOptions
} from './types';

const log = createLog('DungeonProvider');

export const DungeonProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const store = useStore();
  const { dungeon, setDungeon } = useDungeonAtom();
  // null until a generation starts. The stored Dungeon only arrives after the
  // first render, so the progress shown until then follows the Dungeon
  const [progress, setGenerationProgress] = useState<number | null>(null);
  const generationProgress = progress ?? (dungeon ? 100 : 0);

  const { seed, setSeed } = useDungeonSeed();

  // Only sets state from async generation callbacks, so it is safe to start
  // from an effect
  const generate = useCallback(
    async (options: RegenerateDungeonOptions) => {
      const {
        maxRooms = 50,
        seed = Math.floor(Math.random() * 1_000_000),
        signal,
        strategy = 'random'
      } = options;

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
        signal,
        strategy
      });

      setGenerationProgress(100);
      setDungeon(result);
      // setCurrentRoomId(result.rooms[0].id);

      log.debug('Dungeon regenerated', {
        dungeon: result,
        seed,
        strategy
      });
    },
    [setDungeon]
  );

  const regenerate = useCallback(
    (options: RegenerateDungeonOptions) => {
      setGenerationProgress(0);
      return generate(options);
    },
    [generate]
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

  const generateIfMissing = useEffectEvent((signal: AbortSignal) => {
    // The first render saw the atoms' defaults, as atomWithStorage loads the
    // stored values when first subscribed. Those subscriptions are made in
    // effects that run before this one, so the store now holds them
    if (store.get(dungeonAtom)) {
      return;
    }
    const storedSeed = store.get(seedAtom);
    generate({
      maxRooms: 500,
      seed: storedSeed || Math.floor(Math.random() * 1_000_000),
      signal,
      strategy: 'random'
    }).catch(error => {
      if (!signal.aborted) {
        throw error;
      }
    });
  });

  // Generates once on mount. Unmounting aborts the generation, so StrictMode's
  // remount starts a single fresh one instead of racing a second
  useEffect(() => {
    const controller = new AbortController();
    // generate() only sets state after its first await, which this rule
    // cannot see through
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateIfMissing(controller.signal);
    return () => controller.abort();
  }, []);

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
