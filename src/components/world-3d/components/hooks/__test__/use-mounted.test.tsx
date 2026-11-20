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

    test(`settles every promise when retargeted mid-animation${strict ? ' under StrictMode' : ''}`, async () => {
      let api: ReturnType<typeof useMounted> | undefined;

      const Probe = () => {
        api = useMounted({
          initialValues: () => ({ opacity: 0 }),
          mountOnEnter: false,
          targetValues: isMounted => ({
            duration: 100,
            opacity: isMounted ? 0 : 1
          })
        });
        return null;
      };

      const { unmount } = await render(<Probe />, { strict });
      const opacity = () => api!.springs.opacity.get();

      const mounting = api!.startTransitionAnimation(true);
      await waitUntil(() => opacity() > 0.1);
      const unmounting = api!.startTransitionAnimation(false);

      expect(await unmounting).toBe(false);
      expect(await mounting).toBe(false);
      expect(api!.isMounted.current).toBe(false);
      expect(opacity()).toBe(0);

      await unmount();
    });

    test(`resolves pending promises when unmounted mid-animation${strict ? ' under StrictMode' : ''}`, async () => {
      let api: ReturnType<typeof useMounted> | undefined;

      const Probe = () => {
        api = useMounted({
          initialValues: () => ({ opacity: 0 }),
          mountOnEnter: false,
          targetValues: () => ({ duration: 1000, opacity: 1 })
        });
        return null;
      };

      const { unmount } = await render(<Probe />, { strict });
      const mounting = api!.startTransitionAnimation(true);
      await waitUntil(() => api!.springs.opacity.get() > 0);
      await unmount();

      expect(await mounting).toBe(false);
    });
  }
});
