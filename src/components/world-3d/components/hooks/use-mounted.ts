import { easings, useSpring } from '@react-spring/three';
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  type Ref
} from 'react';
import { createLog } from '../../../../helpers/log';
import type { EntityRef } from '../types';
import { useToggleAnimation } from './use-toggle-animation';

const log = createLog('useMounted');

type TargetValueFn = (isMounted: boolean) => {
  duration?: number;
  opacity?: number;
};

export interface UseMountedProps {
  initialValues?: TargetValueFn;
  mountOnEnter?: boolean;
  onMount?: () => Promise<boolean>;
  onUnmount?: () => Promise<boolean>;
  ref?: Ref<EntityRef>;
  targetValues?: TargetValueFn;
}

export const useMounted = ({
  initialValues,
  mountOnEnter = true,
  onMount,
  onUnmount,
  ref,
  targetValues
}: UseMountedProps) => {
  const { animateTo, settled: isMounted, target } = useToggleAnimation(false);

  const [springs, api] = useSpring(() => ({
    ...(initialValues?.(isMounted.current) ?? {})
  }));

  const runCallback = useCallback(
    (enter: boolean) => Promise.resolve(enter ? onMount?.() : onUnmount?.()),
    [onMount, onUnmount]
  );

  const startTransitionAnimation = useCallback(
    (enter: boolean) =>
      animateTo(
        enter,
        onRest => {
          // targetValues describes leaving the given state
          const values = targetValues?.(!enter);
          api.start({
            config: {
              duration: values?.duration ?? 500,
              easing: easings.easeInOutSine
            },
            onRest,
            ...values
          });
        },
        runCallback
      ),
    [animateTo, api, runCallback, targetValues]
  );

  useImperativeHandle(ref, () => ({
    mount: () => startTransitionAnimation(true),
    unmount: () => startTransitionAnimation(false)
  }));

  const mountOnFirstRender = useEffectEvent(() => {
    if (!target.current && mountOnEnter) {
      startTransitionAnimation(true);
    }
  });

  useEffect(() => {
    mountOnFirstRender();
  }, []);

  return { isMounted, springs, startTransitionAnimation };
};
