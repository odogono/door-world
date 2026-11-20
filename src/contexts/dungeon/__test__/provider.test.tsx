import { afterEach, describe, expect, spyOn, test } from 'bun:test';
import { Provider as JotaiProvider, useAtomValue } from 'jotai';
import { act } from 'react';
import {
  render,
  setupDom,
  strictModes,
  waitUntil
} from '../../../__test__/dom';
// spyOn needs the module namespace to replace generateDungeon
// eslint-disable-next-line import-x/no-namespace
import * as dungeonModel from '../../../model/dungeon';
import { dungeonAtom } from '../atoms';
import { useDungeonJourney } from '../hooks/use-dungeon-journey';
import { DungeonProvider } from '../provider';
import { useDungeon } from '../use-dungeon';

setupDom();

describe('DungeonProvider', () => {
  afterEach(() => localStorage.clear());

  for (const strict of strictModes) {
    test(`generates one Dungeon and starts the Journey${strict ? ' under StrictMode' : ''}`, async () => {
      const generateSpy = spyOn(dungeonModel, 'generateDungeon');
      let visibleRoomIds: number[] = [];
      let isGenerated = false;

      const Journey = () => {
        visibleRoomIds = useDungeonJourney().rooms.map(room => room.id);
        return null;
      };

      // Like <Canvas>, the Journey mounts once there is a Dungeon to explore
      const Probe = () => {
        const dungeon = useAtomValue(dungeonAtom);
        isGenerated = (dungeon?.rooms.length ?? 0) > 1;
        return dungeon ? <Journey /> : null;
      };

      const { unmount } = await render(
        <JotaiProvider>
          <DungeonProvider>
            <Probe />
          </DungeonProvider>
        </JotaiProvider>,
        { strict }
      );

      try {
        await waitUntil(
          () =>
            isGenerated &&
            generateSpy.mock.results.length > 0 &&
            visibleRoomIds.length > 0
        );
        // Waits out any second generation, so it would be counted
        const completed = await act(() =>
          Promise.allSettled(
            generateSpy.mock.results.map(result => result.value)
          )
        );
        expect(
          completed.filter(result => result.status === 'fulfilled')
        ).toHaveLength(1);
        expect(visibleRoomIds).toEqual([1]);
      } finally {
        await unmount();
        generateSpy.mockRestore();
      }
    });

    test(`starts the Journey when it mounts before the Dungeon exists${strict ? ' under StrictMode' : ''}`, async () => {
      let visibleRoomIds: number[] = [];
      let hasDungeonOnMount: boolean | undefined;

      const Journey = () => {
        const journey = useDungeonJourney();
        hasDungeonOnMount ??= journey.dungeon !== null;
        visibleRoomIds = journey.rooms.map(room => room.id);
        return null;
      };

      // The Journey mounts in the same commit as the provider
      const { unmount } = await render(
        <JotaiProvider>
          <DungeonProvider>
            <Journey />
          </DungeonProvider>
        </JotaiProvider>,
        { strict }
      );

      try {
        await waitUntil(() => visibleRoomIds.length > 0);
        expect(hasDungeonOnMount).toBe(false);
        expect(visibleRoomIds).toEqual([1]);
      } finally {
        await unmount();
      }
    });

    test(`keeps a stored Dungeon instead of generating one${strict ? ' under StrictMode' : ''}`, async () => {
      const stored = await dungeonModel.generateDungeon({
        maxAttempts: 20,
        maxRooms: 10,
        seed: 42,
        strategy: 'random'
      });
      localStorage.setItem('dungeon', JSON.stringify(stored));

      const generateSpy = spyOn(dungeonModel, 'generateDungeon');
      let seen: ReturnType<typeof useDungeon> | undefined;

      const Probe = () => {
        seen = useDungeon();
        return null;
      };

      const { unmount } = await render(
        <JotaiProvider>
          <DungeonProvider>
            <Probe />
          </DungeonProvider>
        </JotaiProvider>,
        { strict }
      );

      try {
        // Gives a wrongly started generation time to report progress
        await act(() => new Promise(resolve => setTimeout(resolve, 50)));
        expect(generateSpy).not.toHaveBeenCalled();
        expect(seen?.dungeon).toEqual(structuredClone(stored));
        expect(seen?.generationProgress).toBe(100);
        expect(seen?.isGenerating).toBe(false);
      } finally {
        await unmount();
        generateSpy.mockRestore();
      }
    });
  }
});
