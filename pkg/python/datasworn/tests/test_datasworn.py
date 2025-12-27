import importlib
import json
from pathlib import Path

from datasworn.core.models import Expansion, Ruleset, RulesPackage, Type
from rich import print

# import datasworn.classic
# import datasworn.delve
# import datasworn.starforged
# import datasworn.sundered_isles

RULES_PACKAGES = [
    # "classic",
    "delve",
    # "starforged",
    # "sundered_isles",
]


def load_rules_package(package_name: str) -> Ruleset | Expansion:
    package = importlib.import_module(f"datasworn.{package_name}")
    json_file = Path(package.__file__).parent / "json" / f"{package_name}.json"
    with json_file.open() as f:
        rules = f.read()
        rules_json = json.loads(rules)
        if rules_json["type"] == "expansion":
            return Expansion.model_validate_json(rules)
        else:
            return Ruleset.model_validate_json(rules)
        # print(rules_json.keys())
        # rules_package = Ruleset(**rules_json)


def test_datasworn():
    for rules_package in RULES_PACKAGES:
        rules_package = load_rules_package(rules_package)
        # datasworn_tree = {rules_package._id: rules_package}

        _id = rules_package.field_id
        print(f"\n{_id}: {type(rules_package)} {rules_package.type}")

        print(rules_package)

        if rules_package.type == Type.ruleset:
            # rules_package_dict = rules_package.model_dump()
            # datasworn_tree[_id] = Ruleset(**rules_package_dict.model_dump() {"type": "ruleset"})
            print(datasworn_tree[_id])
