# Datasworn v0.1.0

[![@datasworn/core on npm](https://img.shields.io/npm/v/@datasworn/core?logo=npm)](https://www.npmjs.com/package/@datasworn/core)
[![@datasworn/core on npm](https://img.shields.io/npm/dm/@datasworn/core?logo=npm)](https://www.npmjs.com/package/@datasworn/core)
[![Official *Ironsworn* Discord server](https://img.shields.io/discord/437120373436186625?color=%235865F2&label=Ironsworn%20Discord&logo=discord&logoColor=white)](https://discordapp.com/invite/6QMvmJb)

> **Note:** This is an active fork of [rsek/datasworn](https://github.com/rsek/datasworn). See [Fork Status](#fork-status) below.

## What is Datasworn?

Datasworn provides game rules, assets, moves, and oracles from the *Ironsworn* family of tabletop RPGs in a structured JSON format, along with TypeScript typings and JSON schemas.

**This is a pre-release. Until v1.0, breaking changes may occur on any version bump.**

For the original Datasworn JSON files, see the [`legacy` branch](https://github.com/rsek/datasworn/tree/legacy).

## Installation

### JavaScript / TypeScript

```bash
npm install @datasworn/core
npm install @datasworn/starforged
npm install @datasworn/ironsworn-classic
npm install @datasworn/ironsworn-classic-delve
```

### Other Languages

Type definitions for C#, Go, Java, Python, Ruby, and Rust are available in the [json-typedef](json-typedef) directory, generated from [JSON TypeDef](https://jsontypedef.com) schemas.

### Raw JSON

JSON schemas and data are in the [datasworn](datasworn) directory.

## Packages

| Package | Description |
|---------|-------------|
| [`@datasworn/core`](https://www.npmjs.com/package/@datasworn/core) | TypeScript typings and JSON schema |
| [`@datasworn/ironsworn-classic`](https://www.npmjs.com/package/@datasworn/ironsworn-classic) | Original *Ironsworn* rulebook data |
| [`@datasworn/ironsworn-classic-delve`](https://www.npmjs.com/package/@datasworn/ironsworn-classic-delve) | *Ironsworn: Delve* expansion data |
| [`@datasworn/starforged`](https://www.npmjs.com/package/@datasworn/starforged) | *Ironsworn: Starforged* data, SVG icons, WEBP images |

## Fork Status

This fork continues active development while the original repository is inactive. Changes include:

| Feature | Status |
|---------|--------|
| TypeBox 0.34+ compatibility | Fixed |
| Security dependency updates | Applied |
| TypeScript strict mode | Full compliance |
| Starsmith Expanded Oracles | Added |

### Upstream Compatibility

This fork maintains compatibility for potential future reconciliation:

- `upstream-main` branch preserves original repo state
- `fork-base` tag marks the divergence point
- Commit style follows original conventions

### Git Structure

```text
Remotes:
  origin   -> tbsvttr/datasworn (this fork)
  upstream -> rsek/datasworn (original)

Tags:
  fork-base              -> commit where fork diverged
  upstream-snapshot-2024 -> upstream state at time of fork
```

## Development

### Prerequisites

- [Bun](https://bun.sh/) 1.3+ (required for development)

> **Note:** The published npm packages work with both Node.js and Bun. Bun is only required for building from source.

### Setup

```bash
git clone https://github.com/tbsvttr/datasworn.git
cd datasworn
bun install
```

### Build

```bash
bun run build          # Full build
bun run build:schema   # Generate JSON schemas
bun run build:json     # Build game data JSON
bun run build:pkg      # Build npm packages
bun run test           # Run tests
bun run check          # TypeScript type check
```

### Project Structure

```text
datasworn/
├── src/
│   ├── schema/        # TypeBox schema definitions
│   ├── pkg-core/      # Core runtime (IdParser, validators)
│   ├── scripts/       # Build scripts
│   └── types/         # Generated TypeScript types
├── pkg/nodejs/        # npm package sources
├── datasworn/         # Generated JSON output
├── json-typedef/      # Generated type definitions (multi-language)
└── source_data/       # YAML source files
```

## Design Goals

- Language-agnostic JSON schema as source of truth
- Support for both *Ironsworn* and *Starforged*
- Type definitions for multiple languages
- Interchange format for homebrew/3rd party content
- Localization-friendly structure

## Licensing

- **Core package** (typings, JSON schema, tooling): MIT
- **Game content** (rulebook text, images): CC-BY-4.0 or CC-BY-NC-4.0

Licensing information is embedded in the `_source` property throughout the data.

## Contributors

Originally created by [rsek](https://github.com/rsek), now maintained as a community fork.

Special thanks to [XenotropicDev](https://github.com/XenotropicDev) for data from [TheOracle](https://github.com/XenotropicDev/TheOracle).

## Contributing

Contributions welcome! Please:

1. Open an issue to discuss significant changes
2. Follow existing code style
3. Include tests for new functionality
4. Update documentation as needed
