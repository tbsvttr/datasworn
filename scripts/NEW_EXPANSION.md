# Adding a New Expansion

## Quick Start

One command scaffolds everything:

```bash
npm run new:expansion my_expansion starforged "Author Name"
```

This automatically:

- Creates `source_data/my_expansion/assets.yaml`
- Creates `pkg/nodejs/@datasworn-community-content/my-expansion/package.json`
- Adds config to `src/scripts/pkg/pkgConfig.ts`

Then add content and build:

```bash
# Edit source_data/my_expansion/assets.yaml with your content
npm run build:all
```

Or do it all at once with `--build`:

```bash
npm run new:expansion my_expansion classic "Author Name" --build
```

## Script Usage

```
npm run new:expansion <id> <ruleset> <author> [--build]

  id       Expansion ID with underscores (e.g., my_expansion)
  ruleset  classic or starforged
  author   Author name in quotes
  --build  Run build:all after scaffolding
```

The script derives:

- Package name: `my_expansion` → `my-expansion`
- Title: `my_expansion` → `My Expansion`
- Config name: `my_expansion` → `MyExpansion`

---

## Manual Steps (Reference)

If you need to do it manually:

### 1. Create Source Data

Create `source_data/{id}/assets.yaml`:

```yaml
_id: "my_expansion"
datasworn_version: "0.1.0"
type: "expansion"
ruleset: "starforged"
title: "My Expansion"
date: "2024-01-01"
url: ""
license: "https://creativecommons.org/licenses/by/4.0"
authors:
  - name: "Author Name"

assets: {}
```

### 2. Register in pkgConfig.ts

Add to `src/scripts/pkg/pkgConfig.ts`:

```typescript
export const MyExpansion: RulesPackageConfig = {
  type: 'expansion',
  paths: { source: path.join(ROOT_SOURCE_DATA, 'my_expansion') },
  id: 'my_expansion',
  pkg: {
    name: 'my-expansion',
    private: true,
    scope: PKG_SCOPE_COMMUNITY,
    description: 'Datasworn JSON data for My Expansion.',
    keywords: ['ironsworn', 'datasworn', 'TTRPG', 'my-expansion'],
    authors: [{ name: 'Author Name' }],
  },
}
```

### 3. Create Node.js Package

Create `pkg/nodejs/@datasworn-community-content/my-expansion/package.json` with correct dependency:

- Classic expansions: `"@datasworn/ironsworn-classic": "0.1.0"`
- Starforged expansions: `"@datasworn/starforged": "0.1.0"`

### 4. Build

```bash
npm run build:all
```

---

## Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| ENOENT: package.json not found | Missing nodejs package folder | Create package.json in pkg/nodejs/... |
| Expansion not discovered | Not in pkgConfig.ts | Add export to pkgConfig.ts |
| Validation errors | Missing root metadata | Add _id, type, ruleset, title, date, etc. |
