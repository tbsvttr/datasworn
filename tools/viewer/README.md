# Datasworn Viewer

A lightweight browser-based viewer for exploring Datasworn JSON data.

**[View Online →](https://tbsvttr.github.io/datasworn/)**

## Features

- Tree navigation for all content types (moves, assets, oracles, NPCs, truths, atlas)
- Detail panel with formatted markdown rendering
- Cross-reference links between items (`datasworn:` protocol)
- Embedded oracle tables in move text (`{{table>...}}` syntax)
- URL hash routing for direct links and browser history
- Uses `@datasworn/core` TypeScript types

## Usage

From the repository root:

```bash
bun run viewer
```

Or from this directory:

```bash
bun install
bun run dev
```

Then open http://localhost:5173

## Architecture

```
src/
├── main.ts              # App entry point, URL routing
├── state.ts             # State management, navigation
├── style.css            # Styles
├── components/
│   ├── App.ts           # Main layout
│   ├── Sidebar.ts       # Ruleset selector
│   ├── Tree.ts          # Tree navigation
│   └── Detail.ts        # Detail panel rendering
└── utils/
    ├── loader.ts        # JSON data loading
    └── markdown.ts      # Markdown rendering
```

## Type Safety

The viewer uses types from `@datasworn/core` as a reference implementation:

- Type guards for runtime type checking (`isMove`, `isAsset`, etc.)
- Proper Datasworn types in render functions
- Re-exports `Datasworn` namespace for component use
