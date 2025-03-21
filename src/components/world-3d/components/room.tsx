import { darkenColor } from '@helpers/colour';
import { DungeonData, Room as RoomType } from '@model/dungeon';
import { Plane } from '@react-three/drei';

type RoomProps = {
  dungeon: DungeonData;
  renderOrder?: number;
  room?: RoomType;
};

const SCALE = 0.06;

export const Room = ({ dungeon, renderOrder, room }: RoomProps) => {
  if (!room) {
    return null;
  }
  const baseColor = '#e0e0e0';
  const depth = room.depth || 0;
  const colourIncrement = 1 / (dungeon.maxDepth || 1);
  const color = darkenColor(baseColor, depth * colourIncrement);

  const groundColor = room.isCentral ? '#4a9eff' : color;

  const { area } = room;

  const [width, height] = [area.width, area.height];

  return (
    <Plane
      args={[width * SCALE, height * SCALE]}
      position={[
        area.x * SCALE + (width * SCALE) / 2,
        -0.001,
        area.y * SCALE + (height * SCALE) / 2
      ]}
      renderOrder={renderOrder}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <meshStandardMaterial color={groundColor} />
    </Plane>
  );
};
