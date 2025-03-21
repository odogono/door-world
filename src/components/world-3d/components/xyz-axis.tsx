import { Html } from '@react-three/drei';

const AXIS_LENGTH = 1;

// XYZAxis component to display coordinate system
export const XYZAxis = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* X Axis - Red */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            args={[new Float32Array([0, 0, 0, AXIS_LENGTH, 0, 0]), 3]}
            array={new Float32Array([0, 0, 0, AXIS_LENGTH, 0, 0])}
            attach="attributes.position"
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="red" linewidth={2} />
      </line>
      <Html
        center
        position={[AXIS_LENGTH + 0.2, 0, 0]}
        style={{
          color: 'red',
          fontSize: '20px',
          fontWeight: 'bold',
          pointerEvents: 'none'
        }}
      >
        X
      </Html>

      {/* Y Axis - Green */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            args={[new Float32Array([0, 0, 0, 0, AXIS_LENGTH, 0]), 3]}
            array={new Float32Array([0, 0, 0, 0, AXIS_LENGTH, 0])}
            attach="attributes.position"
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="green" linewidth={2} />
      </line>
      <Html
        center
        position={[0, AXIS_LENGTH + 0.2, 0]}
        style={{
          color: 'green',
          fontSize: '20px',
          fontWeight: 'bold',
          pointerEvents: 'none'
        }}
      >
        Y
      </Html>

      {/* Z Axis - Blue */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            args={[new Float32Array([0, 0, 0, 0, 0, AXIS_LENGTH]), 3]}
            array={new Float32Array([0, 0, 0, 0, 0, AXIS_LENGTH])}
            attach="attributes.position"
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="blue" linewidth={2} />
      </line>
      <Html
        center
        position={[0, 0, AXIS_LENGTH + 0.2]}
        style={{
          color: 'blue',
          fontSize: '20px',
          fontWeight: 'bold',
          pointerEvents: 'none'
        }}
      >
        Z
      </Html>
    </group>
  );
};
