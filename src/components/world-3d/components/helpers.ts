import { Vector3 } from 'three';
import type { Position } from '../../../model/dungeon/types';

const SCALE = 0.06;

export const dungeonPositionToVector3 = (
  position: Position | null
): Vector3 | null => {
  if (!position) {
    return null;
  }

  const result = new Vector3(position.x, 0, position.y);

  result.multiplyScalar(SCALE);

  return result;
};
