import { useSpring } from '@react-spring/three';
import { describe, expect, test } from 'bun:test';
import {
  render,
  setupDom,
  strictModes,
  waitUntil
} from '../../../../../__test__/dom';
import { useToggleAnimation } from '../use-toggle-animation';

setupDom();

// opens and closes like a Door's swing
const renderSwing = async (strict: boolean, duration = 100) => {
  let toggle: ReturnType<typeof useToggleAnimation> | undefined;
  let angle = () => -1;
  let setOpen: (open: boolean) => Promise<boolean> = () =>
    Promise.reject(new Error('not rendered'));

  const Probe = () => {
    toggle = useToggleAnimation(false);
    const [spring, api] = useSpring(() => ({ angle: 0 }));
    angle = () => spring.angle.get();
    const { animateTo } = toggle;
    setOpen = (open: boolean) =>
      animateTo(open, onRest => {
        api.start({
          angle: open ? 1 : 0,
          config: { duration },
          onRest
        });
      });
    return null;
  };

  const { unmount } = await render(<Probe />, { strict });
  return { angle: () => angle(), setOpen, toggle: () => toggle!, unmount };
};

describe('useToggleAnimation', () => {
  for (const strict of strictModes) {
    const suffix = strict ? ' under StrictMode' : '';

    test(`resolves to the state it ends in when retargeted mid-swing${suffix}`, async () => {
      const { angle, setOpen, toggle, unmount } = await renderSwing(strict);

      expect(await setOpen(true)).toBe(true);

      const closing = setOpen(false);
      await waitUntil(() => angle() < 0.9);
      const opening = setOpen(true);

      expect(toggle().target.current).toBe(true);
      expect(await opening).toBe(true);
      expect(await closing).toBe(true);
      expect(toggle().settled.current).toBe(true);
      expect(angle()).toBe(1);

      await unmount();
    });

    test(`joins a running animation heading the same way${suffix}`, async () => {
      const { angle, setOpen, unmount } = await renderSwing(strict);

      const first = setOpen(true);
      await waitUntil(() => angle() > 0.1);
      const second = setOpen(true);

      expect(await Promise.all([first, second])).toEqual([true, true]);
      expect(angle()).toBe(1);

      await unmount();
    });

    test(`resolves pending promises with the settled state on unmount${suffix}`, async () => {
      const { angle, setOpen, unmount } = await renderSwing(strict, 1000);

      const opening = setOpen(true);
      await waitUntil(() => angle() > 0);
      await unmount();

      expect(await opening).toBe(false);
    });
  }
});
