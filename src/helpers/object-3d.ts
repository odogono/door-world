import { Material, MeshStandardMaterial, Object3D } from 'three';

export const applyMaterial = (object: Object3D, material: Material) => {
  object.traverse(child => {
    if (child instanceof Object3D && 'material' in child) {
      (child as any).material = material;
    }
  });
};

export const applyColor = (object: Object3D, color: string) => {
  const material = new MeshStandardMaterial({ color });
  applyMaterial(object, material);
};
