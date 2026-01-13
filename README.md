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

### Python

Pydantic V2 packages with full type safety:

```bash
uv add datasworn-core datasworn-starforged
```

Available packages: `datasworn-core`, `datasworn-classic`, `datasworn-delve`, `datasworn-starforged`, `datasworn-sundered-isles`

Community content: `datasworn-community-content-starsmith`, `datasworn-community-content-ancient-wonders`, `datasworn-community-content-fe-runners`

See [pkg/python/README.md](pkg/python/README.md) for details.

### Other Languages

Type definitions for C#, Go, Java, Ruby, and Rust are available in the [json-typedef](json-typedef) directory, generated from [JSON TypeDef](https://jsontypedef.com) schemas.

### Raw JSON

JSON schemas and data are in the [datasworn](datasworn) directory.

## Packages

| Package | Description |
|---------|-------------|
| [`@datasworn/core`](https://www.npmjs.com/package/@datasworn/core) | TypeScript typings and JSON schema |
| [`@datasworn/ironsworn-classic`](https://www.npmjs.com/package/@datasworn/ironsworn-classic) | Original *Ironsworn* rulebook data |
| [`@datasworn/ironsworn-classic-delve`](https://www.npmjs.com/package/@datasworn/ironsworn-classic-delve) | *Ironsworn: Delve* expansion data |
| [`@datasworn/starforged`](https://www.npmjs.com/package/@datasworn/starforged) | *Ironsworn: Starforged* data, SVG icons, WEBP images |

### Community Content (not published to npm)

| Package | Description | Author |
|---------|-------------|--------|
| `sundered_isles` | *Starforged: Sundered Isles* expansion | Shawn Tomkin |
| `starsmith` | Starsmith Expanded Oracles | [Eric Bright](https://playeveryrole.com/) |
| `fe_runners` | Fe-Runners cyberpunk expansion | [Craig Smith](https://zombiecraig.itch.io/) |
| `ancient_wonders` | Ancient Wonders expansion (oracles, assets, moves) | [Ludic Pen](https://www.ludicpen.com/) |

## Fork Status

This fork continues active development while the original repository is inactive. Changes include:

| Feature | Status |
|---------|--------|
| TypeBox 0.34+ compatibility | Fixed |
| Security dependency updates | Applied |
| TypeScript strict mode | Full compliance |
| Starsmith Expanded Oracles | Added |
| Fe-Runners (cyberpunk expansion) | Added |
| Sundered Isles expansion | Added |
| Ancient Wonders expansion | Added |
| Lodestar moves (Ironsworn Classic) | Added |
| Python/Pydantic packages | Added |
| Rust/JTD type generation ([#78](https://github.com/rsek/datasworn/issues/78)) | Fixed |

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

- [Bun](https://bun.sh/) 1.3+ (required)
- [jtd-codegen](https://github.com/jsontypedef/json-typedef-codegen) (optional, for multi-language types)
- [Rust](https://www.rust-lang.org/) (optional, for Rust integration tests)

```bash
# Install jtd-codegen via Homebrew (macOS)
brew install jsontypedef/jsontypedef/jtd-codegen

# Install Rust via asdf (recommended) or rustup
asdf plugin add rust
asdf install rust latest
```

> **Note:** The published npm packages work with both Node.js and Bun. Bun is only required for building from source.

### Setup

```bash
git clone https://github.com/tbsvttr/datasworn.git
cd datasworn
bun install
```

### Build Commands

| Command | Description | Requirements |
|---------|-------------|--------------|
| `bun run build` | Full build (all steps) | jtd-codegen |
| `bun run build:schema` | Generate JSON schemas | - |
| `bun run build:jtd` | Generate multi-language types | jtd-codegen |
| `bun run build:dts` | Generate TypeScript types | - |
| `bun run build:json` | Build game data JSON | - |
| `bun run build:pkg` | Build npm packages | - |
| `bun run test` | Run all tests | Rust (optional) |
| `bun run test:build` | Run build validation tests | Rust (optional) |
| `bun run check` | TypeScript type check | - |
| `bun run viewer` | Launch interactive data viewer | - |

### Online Viewer

Browse the data online at **[tbsvttr.github.io/datasworn](https://tbsvttr.github.io/datasworn/)**

If you don't need multi-language type definitions (C#, Go, Java, Python, Ruby, Rust), you can skip `jtd-codegen` and run individual build commands instead of `bun run build`.

The test suite includes Rust integration tests that verify the generated types can deserialize all JSON data. These tests are automatically skipped if `cargo` is not installed.

### JSON Type Definition (JTD)

The `json-typedef/datasworn.jtd.json` schema is auto-generated from TypeBox definitions in `src/schema/`. TypeBox schemas use `[JsonTypeDef]` annotations to control JTD output:

```typescript
date: Type.String({
    format: 'date',
    [JsonTypeDef]: { schema: JtdType.String() },
})
```

The build process:

1. `bun run build:jtd` runs `src/scripts/json-typedef/index.ts`
2. TypeBox schemas are converted to JTD format via `toJtdRoot()`
3. Output is written to `json-typedef/datasworn.jtd.json`
4. `jtd-codegen` then generates types for Go, Rust, Python, Java, C#, Ruby

### Project Structure

```text
datasworn/
├── src/
│   ├── schema/        # TypeBox schema definitions
│   ├── pkg-core/      # Core runtime (IdParser, validators)
│   ├── scripts/       # Build scripts
│   ├── tests/         # Test suite
│   └── types/         # Generated TypeScript types
├── pkg/
│   ├── nodejs/        # npm package sources
│   └── python/        # Python/Pydantic packages
├── datasworn/         # Generated JSON output
├── json-typedef/      # Generated type definitions (multi-language)
│   └── rust-test/     # Rust integration test project
├── source_data/       # YAML source files
└── tools/
    └── viewer/        # Interactive data browser
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
