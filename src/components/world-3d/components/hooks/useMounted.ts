import { easings, useSpring } from '@react-spring/three';
import {
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';
import { EntityRef } from '../types';

export type UseMountedProps = {
  mountDuration?: number;
  mountOnEnter?: boolean;
  onMount?: () => Promise<boolean>;
  onUnmount?: () => Promise<boolean>;
  ref?: Ref<EntityRef>;
};

export const useMounted = ({
  mountDuration = 500,
  mountOnEnter = true,
  onMount,
  onUnmount,
  ref
}: UseMountedProps) => {
  const isMounted = useRef(false);

  const [springs, api] = useSpring(() => ({
    opacity: isMounted.current ? 1 : 0
  }));

  const startTransitionAnimation = useCallback(
    (enter: boolean) => {
      return Promise.all([
        enter ? onMount?.() : onUnmount?.(),
        new Promise<boolean>(resolve => {
          if (isMounted.current === enter) {
            resolve(isMounted.current);
            return;
          }

          api.start({
            config: { duration: mountDuration, easing: easings.easeInOutSine },
            onRest: async () => {
              isMounted.current = enter;

              resolve(true);
            },
            opacity: enter ? 1 : 0
          });
        })
      ]).then(() => true);
    },
    [api, isMounted, mountDuration, onMount, onUnmount]
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

  return { isMounted, springs };
};
