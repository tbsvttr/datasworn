# Datasworn Python Packages

Python/Pydantic packages for working with [Datasworn](https://github.com/rsek/datasworn) data.

## Packages

### Official Content (`datasworn`)

| Package | Description |
|---------|-------------|
| `datasworn-core` | Pydantic models for Datasworn types |
| `datasworn-classic` | Ironsworn Classic ruleset |
| `datasworn-delve` | Ironsworn: Delve expansion |
| `datasworn-starforged` | Ironsworn: Starforged ruleset |
| `datasworn-sundered-isles` | Sundered Isles expansion |

### Community Content (`datasworn-community-content`)

| Package | Description |
|---------|-------------|
| `datasworn-community-content-ancient-wonders` | Ancient Wonders expansion |
| `datasworn-community-content-fe-runners` | FE Runners expansion |
| `datasworn-community-content-starsmith` | Starsmith expansion |

## Installation

Using [uv](https://github.com/astral-sh/uv):

```bash
# Install core models
uv add datasworn-core

# Install a ruleset/expansion
uv add datasworn-starforged
uv add datasworn-sundered-isles
```

Using pip:

```bash
pip install datasworn-core datasworn-starforged
```

## Usage

```python
import json
from pathlib import Path

from datasworn.core.models import Ruleset, Expansion
import datasworn.starforged

# Load a ruleset
json_path = Path(datasworn.starforged.__file__).parent / "json" / "starforged.json"
with json_path.open() as f:
    data = json.load(f)

ruleset = Ruleset.model_validate(data)

# Access moves, oracles, assets, etc.
print(f"Loaded: {ruleset.field_id.root}")
print(f"Moves: {len(ruleset.moves)}")
print(f"Oracles: {len(ruleset.oracles)}")
```

## Development

### Requirements

- Python 3.13+ (3.14 recommended)
- [uv](https://github.com/astral-sh/uv) package manager

### Regenerating Packages

The Python packages are generated from the Datasworn JSON Schema using `datamodel-code-generator`.

```bash
# From repository root:

# 1. Generate models and copy JSON files
uv run build.py --force

# 2. Post-process to fix code generator limitations
uv run scripts/python/post_process_models.py \
    pkg/python/datasworn/src/datasworn/core/src/datasworn/core/models.py

# 3. Run tests
cd pkg/python/datasworn && uv run pytest tests/ -v
cd ../datasworn-community-content && uv run pytest tests/ -v
```

### Post-Processing

The `datamodel-code-generator` has some limitations with complex JSON Schema constructs. The post-processing script (`scripts/python/post_process_models.py`) fixes:

1. **Empty placeholder classes** - Removes empty classes generated from `allOf` constructs
2. **Type replacements** - Fixes Delve-specific types (Denizens, Features, Dangers)
3. **Date pattern removal** - Removes regex patterns from date fields (Pydantic's date type handles validation)

### Running Tests

```bash
# Official packages
cd pkg/python/datasworn
uv run pytest tests/ -v

# Community content
cd pkg/python/datasworn-community-content
uv run pytest tests/ -v
```

## License

See the main [Datasworn repository](https://github.com/rsek/datasworn) for license information.
