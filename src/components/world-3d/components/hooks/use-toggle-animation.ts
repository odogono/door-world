import { useCallback, useEffect, useRef } from 'react';

/** Starts the animation towards a state, calling onRest when it stops */
export type StartToggleAnimation = (
  onRest: (result: { finished?: boolean }) => void
) => void;

/**
 * Tracks a two-state animation (open/closed, mounted/unmounted) by its target
 * rather than the state it last settled in, so it can be retargeted mid-way.
 *
 * Every promise from animateTo settles, with the state the animation actually
 * ends in. A retargeted animation hands its promises on to the new one, so
 * they don't depend on onRest firing for the superseded animation (react-spring
 * 11 no longer fires it). A cancelled animation, or an unmount, resolves them
 * with the last settled state.
 */
export const useToggleAnimation = (initial: boolean) => {
  // the state the animation last came to rest in
  const settled = useRef(initial);
  // the state the animation is heading towards
  const target = useRef(initial);
  const isAnimating = useRef(false);
  // identifies the latest animation, so superseded ones are ignored
  const generation = useRef(0);
  const pending = useRef<((value: boolean) => void)[]>([]);

  // takes the waiting promises now, so ones added while onArrive runs wait
  // for their own animation
  const takePending = useCallback(() => {
    const resolvers = pending.current;
    pending.current = [];
    return (value: boolean) => {
      for (const resolve of resolvers) {
        resolve(value);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    generation.current++;
    isAnimating.current = false;
    target.current = settled.current;
    takePending()(settled.current);
  }, [takePending]);

  const animateTo = useCallback(
    (
      next: boolean,
      start: StartToggleAnimation,
      onArrive?: (value: boolean) => unknown
    ) =>
      new Promise<boolean>(resolve => {
        pending.current.push(resolve);

        if (target.current === next) {
          // already heading there: the running animation resolves this
          if (!isAnimating.current) {
            const settle = takePending();
            Promise.resolve(onArrive?.(next)).then(() => settle(next));
          }
          return;
        }

        target.current = next;
        isAnimating.current = true;
        const current = ++generation.current;

        start(({ finished }) => {
          if (current !== generation.current) {
            return;
          }

          // react-spring calls onRest with finished false when the animation
          // is stopped rather than reaching its goal
          if (finished === false) {
            cancel();
            return;
          }

          isAnimating.current = false;
          settled.current = next;
          const settle = takePending();
          Promise.resolve(onArrive?.(next)).then(() => settle(next));
        });
      }),
    [cancel, takePending]
  );

  // react-spring stops animations on unmount without calling onRest
  useEffect(() => cancel, [cancel]);

  return { animateTo, settled, target };
};
