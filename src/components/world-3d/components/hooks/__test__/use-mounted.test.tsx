import { describe, expect, test } from 'bun:test';
import {
  render,
  setupDom,
  strictModes,
  waitUntil
} from '../../../../../__test__/dom';
import { useMounted } from '../use-mounted';

setupDom();

describe('useMounted', () => {
  for (const strict of strictModes) {
    test(`fades in once on mount${strict ? ' under StrictMode' : ''}`, async () => {
      let mountCount = 0;
      let opacity = () => -1;

      const Probe = () => {
        const { springs } = useMounted({
          initialValues: () => ({ opacity: 0 }),
          onMount: async () => {
            mountCount++;
            return true;
          },
          targetValues: () => ({ duration: 20, opacity: 1 })
        });
        opacity = () => springs.opacity.get();
        return null;
      };

      const { unmount } = await render(<Probe />, { strict });
      await waitUntil(() => mountCount > 0);

      expect(mountCount).toBe(1);
      expect(opacity()).toBe(1);

      await unmount();
    });
  }
});
