# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- The dev playground runs on Bun's built-in dev server instead of Vite, and
  no longer uses Tailwind.

### Removed

- The `build:dev` script.

## [1.0.0]

### Added

- Consumable package `@odogono/door-world` exporting `<DoorWorld floorText theme />`.
- Code ported from `odogono/odogono.github.io` (`src/components/door-world`,
  last changed in `99995c4`): demo mode, room history, cycling floor text,
  theme-aware colours, door mount transitions.
- Door model and Nohemi Light font embedded as data URLs.
- Dev playground (`bun run dev`) with the 2D debug view.

### Changed

- The host supplies the theme and Floor Text as props; no shared theme atom
  or CSS variables are needed.
- `react`, `three`, `@react-three/fiber` and `@react-three/drei` are now peer
  dependencies; upgraded to three 0.187 and R3F 9.8.

### Removed

- The standalone app shell, the 2D/3D toggle, theme toggle and the unused
  `filth` interpreter.
