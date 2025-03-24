import { createLog } from '@helpers/log';
import { useGLTF } from '@react-three/drei';
import {
  Box3,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Object3DEventMap,
  Plane,
  Vector3,
  Vector3Tuple
} from 'three';

type GLTF = ReturnType<typeof useGLTF>;

const log = createLog('helpers/three');

export const applyMaterial = (object: Object3D, material: Material) => {
  object.traverse(child => {
    if ('material' in child) {
      (child as { material: Material }).material = material;
    }
  });
};

export const applyColor = (object: Object3D, color: string) => {
  const material = new MeshStandardMaterial({ color });
  applyMaterial(object, material);
};

export const isMesh = (object?: unknown): object is Mesh => {
  return (<Mesh>object).isMesh;
};

export const applyClippingPlanesToScene = (
  group: Group<Object3DEventMap>,
  clippingPlanes: Plane[]
) => {
  group.traverse(child => {
    if (isMesh(child)) {
      applyClippingPlanesToMesh(child, clippingPlanes);
    }
  });
};

export const applyClippingPlanesToObject = (
  object: Object3D,
  clippingPlanes: Plane[]
) => {
  object.traverse(child => {
    if (isMesh(child)) {
      applyClippingPlanesToMesh(child, clippingPlanes);
    }
  });
};

export const applyClippingPlanesToMesh = (
  mesh: Mesh,
  clippingPlanes: Plane[]
) => {
  const material = mesh.material as Material;

  if (Array.isArray(material)) {
    mesh.material = material.map(m => {
      m = m.clone();
      m.clippingPlanes = clippingPlanes;
      m.clipShadows = true;
      m.needsUpdate = true;
      return m;
    });
  } else {
    const m = material.clone();
    m.clippingPlanes = clippingPlanes;
    m.clipShadows = true;
    m.needsUpdate = true;
    mesh.material = m;
  }
};

export const vector3ToTuple = (vector3: Vector3): Vector3Tuple => {
  return [vector3.x, vector3.y, vector3.z];
};

export const tupleToVector3 = (tuple: Vector3Tuple): Vector3 => {
  return new Vector3(tuple[0], tuple[1], tuple[2]);
};

export const getObjectBoundingBox = (object: Object3D): Box3 => {
  return new Box3().setFromObject(object);
};

// export const printGLTF = (object: GLTF) => {};
