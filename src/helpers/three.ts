import { Material, Mesh, MeshStandardMaterial, Object3D, Plane } from 'three';

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
