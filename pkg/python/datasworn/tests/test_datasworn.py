"""Tests for Datasworn Python packages.

Validates that all official ruleset/expansion JSON files can be loaded
into Pydantic models without validation errors.
"""

import importlib
import json
from pathlib import Path

import pytest
from datasworn.core.models import Expansion, Ruleset


# All official Datasworn packages
RULES_PACKAGES = [
    "classic",
    "delve",
    "starforged",
    "sundered_isles",
]


def load_rules_package(package_name: str) -> Ruleset | Expansion:
    """Load a rules package JSON file into a Pydantic model."""
    package = importlib.import_module(f"datasworn.{package_name}")
    json_file = Path(package.__file__).parent / "json" / f"{package_name}.json"

    with json_file.open() as f:
        rules_json = json.load(f)

    if rules_json["type"] == "expansion":
        return Expansion.model_validate(rules_json)
    else:
        return Ruleset.model_validate(rules_json)


@pytest.mark.parametrize("package_name", RULES_PACKAGES)
def test_load_rules_package(package_name: str):
    """Test that each rules package loads without validation errors."""
    rules = load_rules_package(package_name)

    # Basic assertions
    assert rules.field_id is not None
    assert rules.type in ("ruleset", "expansion")

    # Check that the package has expected content
    if rules.type == "ruleset":
        assert isinstance(rules, Ruleset)
    else:
        assert isinstance(rules, Expansion)


def test_classic_is_ruleset():
    """Test that classic is a ruleset with expected structure."""
    rules = load_rules_package("classic")
    assert rules.type == "ruleset"
    assert "classic" in rules.field_id.root


def test_delve_is_expansion():
    """Test that delve is an expansion for classic."""
    rules = load_rules_package("delve")
    assert rules.type == "expansion"
    assert "delve" in rules.field_id.root


def test_starforged_is_ruleset():
    """Test that starforged is a ruleset."""
    rules = load_rules_package("starforged")
    assert rules.type == "ruleset"
    assert "starforged" in rules.field_id.root


def test_sundered_isles_is_expansion():
    """Test that sundered_isles is an expansion for starforged."""
    rules = load_rules_package("sundered_isles")
    assert rules.type == "expansion"
    assert "sundered_isles" in rules.field_id.root
