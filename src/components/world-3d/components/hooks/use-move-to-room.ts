import { useCallback, useRef } from 'react';
import { useDungeonJourney } from '../../../../contexts/dungeon/hooks/use-dungeon-journey';
import { createLog } from '../../../../helpers/log';
import { timeoutPromise } from '../../../../helpers/time';
import type { DoorId } from '../../../../model/dungeon';
import type { Position } from '../../../../model/dungeon/types';
import type { DoorRef } from '../door';
import { dungeonPositionToVector3 } from '../helpers';
import type { IsometricCameraMoveToProps } from '../isometric-camera';
import type { RoomRef } from '../room';

const log = createLog('useMoveToRoom', ['debug']);

interface UseMoveToRoomProps {
  moveCameraTo: (props: IsometricCameraMoveToProps) => Promise<void>;
}

export const useMoveToRoom = ({ moveCameraTo }: UseMoveToRoomProps) => {
  const { currentRoom, doors, dungeon, moveToRoom, nextDoorId, rooms } =
    useDungeonJourney();
  const isMoving = useRef(false);

  // Store refs for all doors and rooms
  const doorRefs = useRef<Map<string, DoorRef>>(new Map());
  const roomRefs = useRef<Map<number, RoomRef>>(new Map());

  const moveThroughDoor = useCallback(
    async (doorId: DoorId) => {
      const doorRef = doorRefs.current.get(doorId);

      if (!doorRef) {
        log.error('Missing refs for door transition', { doorId });
        return;
      }

      if (isMoving.current) {
        log.debug('Already moving');
        return;
      }

      isMoving.current = true;

      await moveToRoom({
        doorAction: async (doorId: string, open: boolean) => {
          const doorRef = doorRefs.current.get(doorId);

          if (!doorRef) {
            log.error('Missing refs for door transition', { doorId });
            return false;
          }
          await doorRef.setOpen(open);
          return true;
        },
        doorId,
        moveCameraAction: (position: Position | null) =>
          moveCameraTo({
            position: dungeonPositionToVector3(position)!
          }),
        unmountRoomAction: (roomId: number, doorIds: string[]) => {
          const roomRef = roomRefs.current.get(roomId);

          if (!roomRef) {
            log.debug('[unmountRoomAction] Missing room ref', { roomId });
            return Promise.resolve(false);
          }

          const refs = doorIds.map(id => doorRefs.current.get(id)) as DoorRef[];

          log.debug('[unmountRoomAction] Unmounting room', {
            roomRef,
            unmount: roomRef.unmount
          });

          const unmountPromises = [
            timeoutPromise(roomRef.unmount(), 3000),
            ...refs.map(ref => ref.unmount())
          ];

          log.debug('[unmountRoomAction] Unmounting room', unmountPromises);

          return Promise.all(unmountPromises)
            .then(() => {
              log.debug('[unmountRoomAction] Unmounted room', { roomId });
              return true;
            })
            .catch(error => {
              log.error('[unmountRoomAction] Error unmounting room', {
                error,
                roomId
              });
              return false;
            });
        }
      });

      log.debug('Moved to room', { roomId: doorId });

      isMoving.current = false;
    },
    [moveToRoom, moveCameraTo]
  );

  return {
    currentRoom,
    doorRefs,
    doors,
    dungeon,
    moveThroughDoor,
    nextDoorId,
    roomRefs,
    rooms
  };
};
