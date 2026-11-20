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
  }
});
