# Adding a New Expansion

Checklist for adding new content packages to Datasworn.

## Quick Start

Run the scaffold script:

```bash
npm run new:expansion
```

This creates:

- `source_data/{id}/assets.yaml` - stub source file
- `pkg/nodejs/@datasworn-community-content/{name}/package.json` - nodejs package

Then add the generated config to `pkgConfig.ts` and run `npm run build:all`.

---

## Manual Steps

### 1. Create Source Data

Create `source_data/{expansion_id}/` with YAML files:
- `assets.yaml` - Asset collections
- `oracles.yaml` - Oracle collections (optional)
- `moves.yaml` - Move categories (optional)

### 2. Register Package Config

Add to `src/scripts/pkg/pkgConfig.ts`:

```typescript
export const MyExpansion: RulesPackageConfig = {
  type: 'expansion',
  paths: {
    source: path.join(ROOT_SOURCE_DATA, 'my_expansion'),
  },
  id: 'my_expansion',
  pkg: {
    name: 'my-expansion',
    private: true,  // Set to false when ready for NPM
    scope: PKG_SCOPE_COMMUNITY,  // or PKG_SCOPE_OFFICIAL
    description: 'Datasworn JSON data for My Expansion.',
    keywords: ['ironsworn', 'datasworn', 'TTRPG'],
    authors: [{ name: 'Author Name', url: 'https://...' }],
  },
}
```

### 3. Create Node.js Package Folder

Create `pkg/nodejs/@datasworn-community-content/{expansion}/package.json`:

```json
{
  "name": "@datasworn-community-content/my-expansion",
  "version": "0.1.0",
  "description": "...",
  "files": ["index.js", "index.d.ts", "json", "migration"],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/rsek/datasworn.git",
    "directory": "pkg/nodejs/@datasworn-community-content/my-expansion"
  },
  "keywords": ["ironsworn", "datasworn", "TTRPG"],
  "contributors": [{ "name": "Author", "url": "..." }],
  "license": "CC-BY-4.0",
  "dependencies": {
    "@datasworn/ironsworn-classic": "0.1.0"
  },
  "private": true,
  "type": "module",
  "main": "index.js",
  "types": "index.d.ts",
  "exports": {
    ".": { "types": "./index.d.ts", "default": "./index.js" },
    "./ids": { "types": "./ids.d.ts", "default": "./ids.js" },
    "./json/my_expansion.json": "./json/my_expansion.json"
  }
}
```

**Note:** Use the correct dependency:
- For Classic Ironsworn expansions: `@datasworn/ironsworn-classic`
- For Starforged expansions: `@datasworn/starforged`

### 4. Run Full Build

```bash
npm run build:all
# or manually:
npm run build:json   # Build JSON from YAML
npm run build:pkg    # Build Node.js packages
uv run build.py --force  # Build Python package
```

### 5. Commit All Changes

Check for uncommitted files:
```bash
git status
```

Typical files to commit:
- `source_data/{expansion}/*.yaml`
- `src/scripts/pkg/pkgConfig.ts`
- `datasworn/{expansion}/{expansion}.json`
- `src/migration/history/0.1.0/{expansion}/`
- `pkg/nodejs/@datasworn-community-content/{expansion}/`
- `pkg/python/datasworn/src/datasworn/core/src/datasworn/core/models.py`

## Common Issues

### "ENOENT: package.json not found"
You forgot step 3 - create the Node.js package folder with package.json.

### Expansion not discovered by build
You forgot step 2 - register in pkgConfig.ts.

### Missing root-level metadata
Source YAML needs `_id`, `type`, `ruleset`, `title`, `date`, `url`, `license`, `authors` at root level.
