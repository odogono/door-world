export interface EntityRef {
  mount: () => Promise<boolean>;
  unmount: () => Promise<boolean>;
}
