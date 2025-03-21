// import './index.css';
import { Plane, Sphere } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { Vector3 } from 'three';

// ClickMarker component to show where the ground was clicked
export const ClickMarker = ({ position }: { position: Vector3 }) => {
  return (
    <Sphere args={[0.1, 16, 16]} position={[position.x, 0.1, position.z]}>
      <meshStandardMaterial color="red" />
    </Sphere>
  );
};

// GroundPlane component to handle clicks
export const ClickPlane = ({
  onTargetPositionChange
}: {
  onTargetPositionChange: (pos: Vector3) => void;
}) => {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    // Get the intersection point
    const point = event.point;
    const newCameraTarget = new Vector3(point.x, 0, point.z);

    // log.debug('GroundPlane clicked', newCameraTarget);
    onTargetPositionChange(newCameraTarget);
  };

  return (
    <Plane
      args={[100, 100]}
      onClick={handleClick}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false}
    >
      <meshStandardMaterial opacity={0} />
    </Plane>
  );
};
