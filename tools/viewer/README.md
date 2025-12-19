# Datasworn Viewer

A lightweight browser-based viewer for exploring Datasworn JSON data.

**[View Online →](https://tbsvttr.github.io/datasworn/)**

## Features

- Tree navigation for all content types (moves, assets, oracles, NPCs, truths, atlas)
- Detail panel with formatted markdown rendering
- Rollable oracle tables with dice rolling and result highlighting
- Ask the Oracle odds picker buttons
- Cross-reference links between items (`datasworn:` protocol)
- Embedded oracle tables in move text (`{{table>...}}` and `{{table_columns>...}}` syntax)
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
├── main.ts              # Entry point, event delegation, roll handlers
├── state.ts             # State management, navigation
├── types.ts             # Type definitions and guards
├── style.css            # Styles
├── components/
│   ├── App.ts           # Main layout
│   ├── Sidebar.ts       # Ruleset selector
│   ├── Tree.ts          # Tree navigation
│   └── Detail.ts        # Detail panel orchestration
├── renderers/
│   ├── index.ts         # Renderer exports
│   ├── MoveRenderer.ts  # Move cards with outcomes
│   ├── AssetRenderer.ts # Asset cards with abilities
│   ├── OracleRenderer.ts# Oracle tables and odds buttons
│   ├── NpcRenderer.ts   # NPC cards
│   ├── AtlasRenderer.ts # Atlas entries
│   ├── TruthRenderer.ts # Truth options
│   ├── CollectionRenderer.ts # Collection grids
│   └── GenericRenderer.ts    # Fallback renderer
└── utils/
    ├── loader.ts        # JSON data loading
    ├── markdown.ts      # Markdown rendering
    ├── html.ts          # HTML utilities
    ├── dice.ts          # Dice rolling utilities
    └── formatting.ts    # Label and text formatting
```

## Type Safety

The viewer uses types from `@datasworn/core`:

- Type guards for runtime type checking (`isMove`, `isAsset`, etc.)
- Proper Datasworn types in render functions
- Re-exports `Datasworn` namespace for component use
