# datasworn-core

Pydantic models for Datasworn types. This package provides type-safe Python classes for working with Datasworn JSON data.

## Installation

```bash
uv add datasworn-core
```

## Usage

```python
from datasworn.core.models import Ruleset, Expansion, Move, Asset

# Load and validate JSON data
ruleset = Ruleset.model_validate(json_data)
```
