import { useCallback, useEffect, useRef } from 'react';
import {
  clearRunAfterMs,
  runAfterMs,
  type TimeoutId
} from '../../../../helpers/time';

// How long the visitor must be idle before Demo Mode takes the next step
const DEMO_MODE_DELAY_MS = 5000;

interface UseDemoModeProps {
  onDemoStep: () => void;
}

/**
 * Demo Mode: while the visitor is idle, the Journey carries on by itself.
 * Call cancelDemoStep when the visitor acts and scheduleDemoStep once the
 * resulting move has finished.
 */
export const useDemoMode = ({ onDemoStep }: UseDemoModeProps) => {
  const demoStepTimeout = useRef<TimeoutId | undefined>(undefined);

  const cancelDemoStep = useCallback(() => {
    demoStepTimeout.current = clearRunAfterMs(demoStepTimeout.current);
  }, []);

  const scheduleDemoStep = useCallback(() => {
    cancelDemoStep();
    demoStepTimeout.current = runAfterMs(DEMO_MODE_DELAY_MS, onDemoStep);
  }, [cancelDemoStep, onDemoStep]);

  useEffect(() => {
    scheduleDemoStep();

    return () => {
      cancelDemoStep();
    };
  }, [cancelDemoStep, scheduleDemoStep]);

  return {
    cancelDemoStep,
    scheduleDemoStep
  };
};
