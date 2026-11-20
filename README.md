# door-world

A navigable (somewhat) procedurally generated world with a lot of doors.

Door World is a React Three Fiber component. It is the canonical home of the
code shown on [opendoorgonorth.com](https://opendoorgonorth.com) and
[odgn.net](https://odgn.net).

## Using it

Install from a git tag (see [ADR 0001](./docs/adr/0001-git-tagged-source-package.md)):

```sh
bun add github:odogono/door-world#v1.0.0 three @react-three/fiber @react-three/drei
```

```tsx
import { DoorWorld } from '@odogono/door-world';

<DoorWorld floorText="odgn" theme="dark" />;
```

| Prop        | Type                | Default   | Notes                                       |
| ----------- | ------------------- | --------- | ------------------------------------------- |
| `floorText` | `string`            | none      | Words written on the starting room's floor  |
| `theme`     | `'light' \| 'dark'` | `'light'` | The host owns theme state and passes it in  |
| `className` | `string`            |           | Applied to the container (fills its parent) |
| `style`     | `CSSProperties`     |           | Merged over the container's default style   |

- The package ships TypeScript source; the host's bundler (Vite/Astro) compiles it.
- The door model and Floor Text font are embedded as data URLs, so hosts need no
  asset configuration.
- It is browser-only: in Astro use `client:only="react"`.
- `react`, `react-dom`, `three`, `@react-three/fiber` and `@react-three/drei` are
  peer dependencies.
- The generated world and the current room persist in `localStorage`.

### Known limitations

- Does not yet render under React `<StrictMode>` (double-invoked effects).
- Stays on jotai 2.x: under jotai 3 the world does not render.
- `@react-spring/three` is pinned to 9.7.5.

## Developing

```sh
bun install
bun run dev      # playground in ./dev, with the internal 2D debug view
bun run check    # tsc, eslint, prettier, bun test
```

To work on a host at the same time, `bun link` in this repo and
`bun link @odogono/door-world` in the host.

After changing anything in `./assets`, run `bun run embed-assets`.

## Releasing

Bump `version` in `package.json`, update `CHANGELOG.md`, then tag `vX.Y.Z` and push
the tag. Hosts update their dependency to the new tag.
