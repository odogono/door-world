// Test helpers for rendering components into a happy-dom document, with and
// without React's <StrictMode>
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { Globals } from '@react-spring/three';
import { afterAll, beforeAll, spyOn } from 'bun:test';
import { act, StrictMode, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

export const strictModes = [false, true] as const;

// happy-dom's timers die with its window, which would strand react-spring's
// pending frame and stall every later test file's springs
const nativeSetTimeout = globalThis.setTimeout;

/** Registers a DOM for the current test file only */
export const setupDom = () => {
  const debugSpy = spyOn(console, 'debug');

  beforeAll(() => {
    debugSpy.mockImplementation(() => {});
    GlobalRegistrator.register();
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    // Outside a <Canvas>, nothing advances @react-spring/three's frames, and
    // it read requestAnimationFrame before this DOM existed
    Globals.assign({
      frameLoop: 'always',
      requestAnimationFrame: callback => nativeSetTimeout(callback, 16)
    });
  });

  afterAll(async () => {
    debugSpy.mockRestore();
    Globals.assign({ frameLoop: 'demand' });
    await GlobalRegistrator.unregister();
  });
};

export const render = async (
  element: ReactNode,
  { strict }: { strict: boolean }
) => {
  const container = document.createElement('div');
  document.body.append(container);
  let root: Root | undefined;
  await act(async () => {
    root = createRoot(container);
    root.render(strict ? <StrictMode>{element}</StrictMode> : element);
  });
  return {
    unmount: () => act(() => root?.unmount())
  };
};

/** Waits, flushing React updates, until the condition holds */
export const waitUntil = async (
  condition: () => boolean,
  { timeoutMs = 3000 } = {}
) => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Condition not met within ${timeoutMs}ms`);
    }
    await act(() => new Promise(resolve => setTimeout(resolve, 10)));
  }
};
