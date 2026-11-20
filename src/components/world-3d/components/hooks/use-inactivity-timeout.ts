import { useCallback, useEffect, useRef } from 'react';
import {
  clearRunAfterMs,
  runAfterMs,
  type TimeoutId
} from '../../../../helpers/time';

const INACTIVITY_TIMEOUT = 5000;

interface UseInactivityTimeoutProps {
  onInactivityTimeout: () => void;
}

export const useInactivityTimeout = ({
  onInactivityTimeout
}: UseInactivityTimeoutProps) => {
  const inactivityTimeout = useRef<TimeoutId | undefined>(undefined);

  const clearInactivityTimeout = useCallback(() => {
    inactivityTimeout.current = clearRunAfterMs(inactivityTimeout.current);
  }, []);

  const resetInactivityTimeout = useCallback(() => {
    clearInactivityTimeout();
    inactivityTimeout.current = runAfterMs(INACTIVITY_TIMEOUT, () => {
      onInactivityTimeout();
    });
  }, [clearInactivityTimeout, onInactivityTimeout]);

  useEffect(() => {
    resetInactivityTimeout();

    return () => {
      clearInactivityTimeout();
    };
  }, [clearInactivityTimeout, resetInactivityTimeout]);

  return {
    clearInactivityTimeout,
    resetInactivityTimeout
  };
};
