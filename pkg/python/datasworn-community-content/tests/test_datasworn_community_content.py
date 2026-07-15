"""Tests for the Datasworn community-content Python packages.

Validates that every community rules-package JSON file can be loaded into
Pydantic models without validation errors and exposes the expected fields.
"""

import importlib
import json
from pathlib import Path

import pytest
from datasworn.core.models import Expansion, Ruleset

NAMESPACE = "datasworn_community_content"

RULES_PACKAGES = [
    "ancient_wonders",
    "fe_runners",
    "starsmith",
]


def load_rules_package(package_name: str) -> Ruleset | Expansion:
    """Load a rules package JSON file into a Pydantic model."""
    package = importlib.import_module(f"{NAMESPACE}.{package_name}")
    json_file = Path(package.__file__).parent / "json" / f"{package_name}.json"

    with json_file.open() as f:
        rules_json = json.load(f)

    if rules_json["type"] == "expansion":
        return Expansion.model_validate(rules_json)
    return Ruleset.model_validate(rules_json)


@pytest.mark.parametrize("package_name", RULES_PACKAGES)
def test_load_rules_package(package_name: str):
    """Each community rules package loads without validation errors."""
    rules = load_rules_package(package_name)

    assert rules.id is not None
    assert isinstance(rules.id, str)
    assert package_name in rules.id
    assert rules.type in ("ruleset", "expansion")

    if rules.type == "ruleset":
        assert isinstance(rules, Ruleset)
    else:
        assert isinstance(rules, Expansion)
