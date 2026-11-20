import { easings, useSpring } from '@react-spring/three';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type Ref
} from 'react';
import { createLog } from '../../../../helpers/log';
import type { EntityRef } from '../types';

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
  const isMounted = useRef(false);
  const isMounting = useRef(false);

  const [springs, api] = useSpring(() => ({
    ...(initialValues?.(isMounted.current) ?? {})
  }));

  const runCallback = useCallback(
    (enter: boolean) => Promise.resolve(enter ? onMount?.() : onUnmount?.()),
    [onMount, onUnmount]
  );

  const startTransitionAnimation = useCallback(
    (enter: boolean) =>
      new Promise<boolean>(resolve => {
        if (isMounted.current === enter) {
          runCallback(enter).then(() => resolve(isMounted.current));
          return;
        }

        if (isMounting.current) {
          return;
        }

        isMounting.current = true;

        const duration = targetValues?.(isMounted.current)?.duration ?? 500;
        const values = targetValues?.(isMounted.current);

        api.start({
          config: { duration, easing: easings.easeInOutSine },
          onRest: async () => {
            isMounted.current = enter;
            isMounting.current = false;

            runCallback(enter).then(() => resolve(enter));
          },
          ...values
          // opacity
        });
      }),
    [api, isMounted, runCallback, targetValues]
  );

  useImperativeHandle(ref, () => ({
    mount: () => startTransitionAnimation(true),
    unmount: () => startTransitionAnimation(false)
  }));

  useEffect(() => {
    if (!isMounted.current && mountOnEnter) {
      startTransitionAnimation(true);
    }
  }, [startTransitionAnimation, mountOnEnter]);

  return { isMounted, springs, startTransitionAnimation };
};
