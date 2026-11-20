# Door World is consumed as a git-tagged source package

Door World is shown on two sites, opendoorgonorth.com and odgn.net, and this repo
is its canonical home. Hosts depend on it as
`github:odogono/door-world#vX.Y.Z`; the package ships its TypeScript source
(compiled by the host's Vite-based bundler) with binary assets embedded as data
URLs, and there is no build step or registry.

We considered copying the code into each site (cheapest, but two copies had
already drifted once: this repo fell two months behind the opendoorgonorth.com
copy), and publishing to npm (cleanest consumption, but needs an npm account
and a publish step for a package with two consumers, both ours). A git
dependency pinned to a tag gives versioned, reviewable releases with no
infrastructure; shipping source avoids committing build output, since package
managers do not reliably run `prepare` for git dependencies.

## Consequences

- Hosts must use a bundler that compiles TypeScript/TSX from dependencies (Vite
  and Astro do).
- Releases are git tags; a moved tag would silently change what hosts install,
  so tags are never moved.
- If anyone outside these two sites consumes it, revisit publishing to npm with
  a built `dist`.
