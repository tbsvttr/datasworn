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
    assert rules.id is not None
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
    # field_id is now a plain string (type alias), no .root needed
    assert "classic" in rules.id


def test_delve_is_expansion():
    """Test that delve is an expansion for classic."""
    rules = load_rules_package("delve")
    assert rules.type == "expansion"
    assert "delve" in rules.id


def test_starforged_is_ruleset():
    """Test that starforged is a ruleset."""
    rules = load_rules_package("starforged")
    assert rules.type == "ruleset"
    assert "starforged" in rules.id


def test_sundered_isles_is_expansion():
    """Test that sundered_isles is an expansion for starforged."""
    rules = load_rules_package("sundered_isles")
    assert rules.type == "expansion"
    assert "sundered_isles" in rules.id


class TestTypeAliasErgonomics:
    """Test that ID types are plain strings, not RootModel wrappers.

    This verifies the post-processing that converts RootModel[str] to type aliases
    is working correctly, allowing direct string operations without .root access.
    """

    def test_ruleset_id_is_string(self):
        """RulesetId should be usable as a plain string."""
        rules = load_rules_package("starforged")
        # ID is directly a string - no .root needed
        assert isinstance(rules.id, str)
        assert rules.id == "starforged"
        # String operations work directly
        assert rules.id.startswith("star")
        assert len(rules.id) == 10

    def test_move_id_is_string(self):
        """MoveId should be usable as a plain string."""
        rules = load_rules_package("starforged")
        assert rules.moves is not None

        # Get first move from first category
        first_category = next(iter(rules.moves.values()))
        assert first_category.contents is not None
        first_move = next(iter(first_category.contents.values()))

        # Move ID is now a properly typed field (discriminated union)
        assert hasattr(first_move, "id")
        assert isinstance(first_move.id, str)
        assert first_move.id.startswith("move:")
        # Can use string operations directly
        parts = first_move.id.split("/")
        assert len(parts) >= 2
        # Also verify the move has other expected typed fields
        assert hasattr(first_move, "name")
        assert isinstance(first_move.name, str)

    def test_oracle_id_is_string(self):
        """OracleRollableId should be usable as a plain string."""
        rules = load_rules_package("starforged")
        assert rules.oracles is not None

        # Navigate to an oracle (now properly typed via discriminated union)
        for collection in rules.oracles.values():
            if collection.contents:
                for oracle in collection.contents.values():
                    # Oracle ID is now a properly typed field
                    assert hasattr(oracle, "id")
                    assert isinstance(oracle.id, str)
                    assert oracle.id.startswith("oracle")
                    # Also verify the oracle has other expected typed fields
                    assert hasattr(oracle, "name")
                    assert isinstance(oracle.name, str)
                    return
        pytest.skip("No oracle found")

    def test_asset_id_is_string(self):
        """AssetId should be usable as a plain string."""
        rules = load_rules_package("starforged")
        assert rules.assets is not None

        # Get first asset from first collection
        first_collection = next(iter(rules.assets.values()))
        assert first_collection.contents is not None
        first_asset = next(iter(first_collection.contents.values()))

        # Asset ID is directly a string
        assert isinstance(first_asset.id, str)
        assert first_asset.id.startswith("asset:")
        # Can use in f-strings directly
        message = f"Loading asset: {first_asset.id}"
        assert "asset:" in message

    def test_markdown_string_is_string(self):
        """MarkdownString should be usable as a plain string."""
        rules = load_rules_package("starforged")
        assert rules.moves is not None

        first_category = next(iter(rules.moves.values()))
        assert first_category.contents is not None
        first_move = next(iter(first_category.contents.values()))

        # text is MarkdownString which is now a plain string
        if first_move.text:
            assert isinstance(first_move.text, str)
            # Can use string operations directly
            assert len(first_move.text) > 0
