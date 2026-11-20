# Door World

- Use Bun, not npm/yarn/pnpm. `bun run check` must pass (tsc, eslint, prettier, tests).
- This is a library: the public API is `src/index.ts` and the package ships its
  TypeScript source (see `docs/adr/0001-git-tagged-source-package.md`).
- `dev/` is an unpublished playground (`bun run dev`). Keep CSS imports and other
  playground-only concerns out of `src/`.
- `src/assets.generated.ts` is generated; after changing `assets/`, run
  `bun run embed-assets`.
- Domain terms are defined in `GLOSSARY.md`; use them in code and docs.
