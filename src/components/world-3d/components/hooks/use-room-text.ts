import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject
} from 'react';
import { useFloorText } from '../../../../contexts/floor-text/context';
import {
  clearRunAfterMs,
  runAfterMs,
  type TimeoutId
} from '../../../../helpers/time';
import { type Room as RoomModel } from '../../../../model/dungeon';
import type { EntityRef } from '../types';

interface RoomTextProps {
  interval: number;
  room: RoomModel | undefined;
  textRef: RefObject<EntityRef | null>;
}

export const useRoomText = ({ interval, room, textRef }: RoomTextProps) => {
  const hostFloorText = useFloorText();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const textTransitionTimeoutId = useRef<TimeoutId | null>(null);

  const textScript = useMemo(() => {
    if (!room) {
      return [];
    }

    // The central room shows the host's Floor Text
    const floorText = room.isCentral ? hostFloorText : room.floorText;

    if (!floorText) {
      return [];
    }

    return [floorText];
  }, [room, hostFloorText]);

  const runTextTransition = useCallback(() => {
    setIsTransitioning(true);
    clearRunAfterMs(textTransitionTimeoutId.current);
    textTransitionTimeoutId.current = runAfterMs(interval, () =>
      setIsTransitioning(false)
    );
  }, [interval]);

  // Handle text cycling. Cleanup cancels a cycle in progress, so StrictMode's
  // remount does not run two at once
  useEffect(() => {
    if (!room || !isTransitioning) {
      return;
    }

    let isCancelled = false;

    const cycleText = async () => {
      // Unmount current text
      if (textRef.current) {
        await textRef.current.unmount();
      }
      if (isCancelled) {
        return;
      }

      setCurrentTextIndex(prev => (prev + 1) % textScript.length);

      // Mount new text
      if (textRef.current) {
        await textRef.current.mount();
      }
      if (isCancelled) {
        return;
      }

      // Schedule next transition
      runTextTransition();
    };

    cycleText();

    return () => {
      isCancelled = true;
    };
  }, [room, isTransitioning, textRef, textScript, runTextTransition]);

  useEffect(
    () => () => {
      clearRunAfterMs(textTransitionTimeoutId.current);
    },
    []
  );

  return {
    runTextTransition,
    text: textScript[currentTextIndex]
  };
};
