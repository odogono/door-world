export type EntityRef = {
  mount: () => Promise<boolean>;
  unmount: () => Promise<boolean>;
};
