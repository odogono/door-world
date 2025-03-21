import { createLog } from '@helpers/log';
import { Door, DungeonData, Room } from '@model/dungeon';
import { Vector3 } from 'three';
import { useDungeonCurrentRoom } from '../../../contexts/dungeon/atoms';
import { Door as Door3d } from './door';
import { Room as Room3d } from './room';

const log = createLog('Dungeon');

type DungeonProps = {
  currentRoom: Room | null | undefined;
  dungeon: DungeonData | null;
};

const SCALE = 0.06;

export const Dungeon = () => {
  const { currentRoom, dungeon } = useDungeonCurrentRoom();

  if (!dungeon) {
    return null;
  }

  const { doors, rooms } = dungeon;

  return (
    <>
      {rooms.map(room => (
        <Room3d dungeon={dungeon} key={room.id} room={room} />
      ))}
      {doors.map(door => (
        <DoorContainer door={door} key={`door-${door.room1}-${door.room2}`} />
      ))}
    </>
  );
};

type DoorContainerProps = {
  door: Door;
};

const DoorContainer = ({ door }: DoorContainerProps) => {
  const { position, room1, room2 } = door;

  const position3d = new Vector3(position.x + 4, 0, position.y + 4);
  position3d.multiplyScalar(SCALE);
  const rotationY = getDoorRotationY(door);

  return (
    <Door3d
      doorColor="#00f900"
      id={`door-${room1}-${room2}`}
      isOpen={false}
      position={position3d}
      rotationY={rotationY}
    />
  );
};

const getDoorRotationY = (door: Door) => {
  const { dir } = door;

  switch (dir) {
    case 'NORTH':
      return -Math.PI / 2;
    case 'EAST':
      return -Math.PI;
    case 'SOUTH':
      return Math.PI / 2;
    case 'WEST':
      return 0;
  }
};
