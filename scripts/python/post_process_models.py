"""
Post-processing script for generated Pydantic models.

The datamodel-code-generator has limitations with certain JSON Schema constructs:
1. allOf with tuple types generates empty placeholder classes
2. Pattern + format on date fields causes validation issues
3. RootModel[str] for ID types requires .root access (convert to type aliases)

This script fixes these issues automatically after generation.
"""

import re
import sys
from pathlib import Path
from typing import Any


# Classes that should be removed (empty placeholders from allOf)
EMPTY_CLASSES_TO_REMOVE = [
    "Denizens",
    "Features",
    "Dangers",
]

# RootModel classes that should be converted to type aliases
# These simple wrapper types don't need RootModel - they can be Annotated types directly
# This eliminates the need to use .root to access the underlying value
ROOTMODEL_TYPES_TO_CONVERT = [
    # Primary ID types
    "RulesetId",
    "ExpansionId",
    "AssetId",
    "AssetCollectionId",
    "AtlasCollectionId",
    "AtlasEntryId",
    "DelveSiteId",
    "DelveSiteDomainId",
    "DelveSiteThemeId",
    "MoveCategoryId",
    "MoveId",
    "NpcId",
    "NpcCollectionId",
    "OracleCollectionId",
    "OracleRollableId",
    "RarityId",
    "TruthId",
    # Embedded ID types
    "AssetAbilityId",
    "AssetAbilityMoveId",
    "AssetAbilityMoveConditionId",
    "AssetAbilityMoveOutcomeId",
    "AssetAbilityOracleRollableId",
    "AssetAbilityOracleRollableRowId",
    "DelveSiteDenizensId",
    "DelveSiteDenizenId",
    "DelveSiteDomainDangersId",
    "DelveSiteDomainDangerId",
    "DelveSiteDomainFeaturesId",
    "DelveSiteDomainFeatureId",
    "DelveSiteThemeDangersId",
    "DelveSiteThemeDangerId",
    "DelveSiteThemeFeaturesId",
    "DelveSiteThemeFeatureId",
    "MoveConditionId",
    "MoveOutcomeId",
    "MoveOracleRollableId",
    "MoveOracleRollableRowId",
    "NpcVariantId",
    "OracleRollableRowId",
    "TruthOptionId",
    "TruthOptionOracleRollableId",
    "TruthOptionOracleRollableRowId",
    # Wildcard types
    "AssetAbilityIdWildcard",
    "AssetAbilityMoveIdWildcard",
    "AssetAbilityMoveConditionIdWildcard",
    "AssetAbilityMoveOutcomeIdWildcard",
    "AssetAbilityOracleRollableIdWildcard",
    "AssetAbilityOracleRollableRowIdWildcard",
    "AssetCollectionIdWildcard",
    "AssetIdWildcard",
    "AtlasCollectionIdWildcard",
    "AtlasEntryIdWildcard",
    "DelveSiteDenizensIdWildcard",
    "DelveSiteDenizenIdWildcard",
    "DelveSiteDomainDangersIdWildcard",
    "DelveSiteDomainDangerIdWildcard",
    "DelveSiteDomainFeaturesIdWildcard",
    "DelveSiteDomainFeatureIdWildcard",
    "DelveSiteDomainIdWildcard",
    "DelveSiteIdWildcard",
    "DelveSiteThemeDangersIdWildcard",
    "DelveSiteThemeDangerIdWildcard",
    "DelveSiteThemeFeaturesIdWildcard",
    "DelveSiteThemeFeatureIdWildcard",
    "DelveSiteThemeIdWildcard",
    "ExpansionIdWildcard",
    "MoveCategoryIdWildcard",
    "MoveConditionIdWildcard",
    "MoveIdWildcard",
    "MoveOutcomeIdWildcard",
    "MoveOracleRollableIdWildcard",
    "MoveOracleRollableRowIdWildcard",
    "NpcCollectionIdWildcard",
    "NpcIdWildcard",
    "NpcVariantIdWildcard",
    "OracleCollectionIdWildcard",
    "OracleRollableIdWildcard",
    "OracleRollableRowIdWildcard",
    "RarityIdWildcard",
    "RulesetIdWildcard",
    "TruthIdWildcard",
    "TruthOptionIdWildcard",
    "TruthOptionOracleRollableIdWildcard",
    "TruthOptionOracleRollableRowIdWildcard",
    # String wrapper types
    "MarkdownString",
    "MarkdownTemplateString",
    "Label",
    "DictKey",
    "WebUrl",
    "CssColor",
    "DiceExpression",
    "Documentation",
    "SemanticVersion",
    "SvgImageUrl",
    "WebpImageUrl",
    # Types with other inner types (still convert to type aliases)
    "ConditionMeterKey",
    "EmbeddedMoveId",
    "EmbeddedMoveIdWildcard",
    "NpcNature",
    "RulesPackageId",
    "SpecialTrackType",
    "StatKey",
    # Union wrapper types - these are just unions and can be type aliases
    "AnyMove",
    "AnyMoveId",
    "AnyMoveConditionIdWildcard",
    "AnyMoveOutcomeIdWildcard",
    "AnyOracleRollable",
    "AnyOracleRollableId",
    "AnyOracleRollableIdWildcard",
    "AnyOracleRollableRowIdWildcard",
    # Schema-related types
    "DataswornV010",
    "Type1",
    "SchemaArray",
    # Note: Max and StringArray are kept as RootModel because they have
    # default values (= None, = []) that are used in field definitions.
]

# Type replacements: placeholder -> actual type
# Simple replacements that don't need context
TYPE_REPLACEMENTS = {
    "list[Denizens]": "list[DelveSiteDenizen]",
    "denizens: Denizens": "denizens: list[DelveSiteDenizen]",
    "Annotated[\n        Denizens,": "Annotated[\n        list[DelveSiteDenizen],",
}


def remove_empty_classes(content: str) -> str:
    """Remove empty placeholder classes generated from allOf constructs."""
    for class_name in EMPTY_CLASSES_TO_REMOVE:
        # Match: class ClassName(BaseModel):\n    pass\n\n
        pattern = rf"^class {class_name}\(BaseModel\):\n    pass\n\n\n"
        content = re.sub(pattern, "", content, flags=re.MULTILINE)
    return content


def convert_rootmodel_to_typealias(content: str) -> str:
    """Convert RootModel classes to type aliases.

    This eliminates the need to use .root to access the underlying value.

    Before (multi-line):
        class AssetId(RootModel[str]):
            root: Annotated[
                str,
                Field(
                    description='...',
                    pattern='...',
                    title='AssetId',
                ),
            ]

    After:
        AssetId = Annotated[
            str,
            Field(
                description='...',
                pattern='...',
                title='AssetId',
            ),
        ]

    Before (single-line):
        class CssColor(RootModel[str]):
            root: Annotated[str, Field(description='...', title='CssColor')]

    After:
        CssColor = Annotated[str, Field(description='...', title='CssColor')]
    """
    for type_name in ROOTMODEL_TYPES_TO_CONVERT:
        # Pattern 1: Match multi-line RootModel class definition
        # The Annotated block spans multiple lines with nested brackets
        # Use .* for RootModel generic param to handle nested brackets like list[Schema1 | bool]
        multiline_pattern = rf"class {type_name}\(RootModel\[.*\]\):\n    root: (Annotated\[\n(?:.*\n)*?    \])\n"

        def make_replacement(name : str) -> Any:
            def replacement(match : Any) -> str:
                annotated_type = match.group(1)
                return f"{name} = {annotated_type}\n"
            return replacement

        content = re.sub(multiline_pattern, make_replacement(type_name), content)

        # Pattern 2: Match single-line RootModel class definition
        # The Annotated block is on a single line
        # Use .* for RootModel generic param to handle nested brackets like list[Schema1 | bool]
        singleline_pattern = rf"class {type_name}\(RootModel\[.*\]\):\n    root: (Annotated\[[^\n]+\])\n"

        content = re.sub(singleline_pattern, make_replacement(type_name), content)

    return content


def replace_placeholder_types(content: str) -> str:
    """Replace placeholder types with actual types."""
    for placeholder, actual in TYPE_REPLACEMENTS.items():
        content = content.replace(placeholder, actual)
    return content


def replace_features_dangers_contextually(content: str) -> str:
    """Replace Features/Dangers placeholders based on class context.

    DelveSiteDomain uses DelveSiteDomainFeature/DelveSiteDomainDanger
    DelveSiteTheme uses DelveSiteThemeFeature/DelveSiteThemeDanger
    """
    # Replace in DelveSiteDomain class context
    content = re.sub(
        r"(class DelveSiteDomain\(BaseModel\):.*?)(features: Features)",
        r"\1features: list[DelveSiteDomainFeature]",
        content,
        flags=re.DOTALL,
    )
    content = re.sub(
        r"(class DelveSiteDomain\(BaseModel\):.*?)(dangers: Dangers)",
        r"\1dangers: list[DelveSiteDomainDanger]",
        content,
        flags=re.DOTALL,
    )

    # Replace in DelveSiteTheme class context
    content = re.sub(
        r"(class DelveSiteTheme\(BaseModel\):.*?)(features: Features)",
        r"\1features: list[DelveSiteThemeFeature]",
        content,
        flags=re.DOTALL,
    )
    content = re.sub(
        r"(class DelveSiteTheme\(BaseModel\):.*?)(dangers: Dangers)",
        r"\1dangers: list[DelveSiteThemeDanger]",
        content,
        flags=re.DOTALL,
    )

    return content


def remove_date_pattern(content: str) -> str:
    """Remove pattern= from date fields.

    Pydantic's date type handles validation natively, and pattern regex
    cannot be applied to date objects (only strings). The pattern in the
    JSON Schema is for documentation/other consumers.
    """
    # Match pattern lines within date field definitions
    # The generated code has: pattern='[0-9]{4}-((0[0-9])|(1[0-2]))-(([0-2][0-9])|(3[0-1]))',
    date_pattern = r"            pattern='[^']+',\n"
    # Only remove when it appears near date_aliased (to avoid removing other patterns)
    content = re.sub(
        r"(date: Annotated\[\n        date_aliased,\n        Field\(\n            description=\"[^\"]+\",\n)" + date_pattern,
        r"\1",
        content,
    )
    # Also handle alternate ordering where pattern comes first
    content = re.sub(
        r"(date: Annotated\[\n        date_aliased,\n        Field\(\n)" + date_pattern,
        r"\1",
        content,
    )
    return content


def add_discriminator_import(content: str) -> str:
    """Add Discriminator to pydantic imports if not already present."""
    if "Discriminator" not in content:
        content = re.sub(
            r"from pydantic import (.+)",
            r"from pydantic import Discriminator, \1",
            content,
            count=1,
        )
    return content


def add_discriminated_unions(content: str) -> str:
    """Add discriminated union type aliases for polymorphic types.

    The code generator creates base classes with extra='allow' for polymorphic types.
    This replaces generic base class references with proper typed unions with
    Pydantic discriminators for correct deserialization.

    Move: MoveActionRoll | MoveNoRoll | MoveProgressRoll | MoveSpecialTrack (roll_type)
    OracleRollableTable: OracleTableText | OracleTableText2 | OracleTableText3 (oracle_type)
    """
    # Add Discriminator import
    content = add_discriminator_import(content)

    # Replace dict[str, Move] with typed union + discriminator in MoveCategory
    content = re.sub(
        r"contents: dict\[str, Move\]",
        "contents: dict[str, Annotated[MoveActionRoll | MoveNoRoll | MoveProgressRoll | MoveSpecialTrack, Discriminator('roll_type')]]",
        content,
    )

    # Replace dict[str, OracleRollableTable] with typed union + discriminator
    content = re.sub(
        r"contents: dict\[str, OracleRollableTable\]",
        "contents: dict[str, Annotated[OracleTableText | OracleTableText2 | OracleTableText3, Discriminator('oracle_type')]]",
        content,
    )
    
    # replace EmbeddedOracleRollable base class with discriminated union
    content = re.sub(
        r"class EmbeddedOracleRollable\(BaseModel\):\n    model_config = ConfigDict\(\n        extra='allow',\n    \)\n    oracle_type: OracleType",
        """\
EmbeddedOracleRollable = Annotated[
        "EmbeddedOracleColumnText | EmbeddedOracleColumnText2 | EmbeddedOracleColumnText3 | EmbeddedOracleTableText | EmbeddedOracleTableText2 | EmbeddedOracleTableText3",
        Discriminator('oracle_type'),
    ]""", 
    content,
    )

    # replace EmbeddedMove with discriminated union
    content = re.sub(
        r"class EmbeddedMove\(BaseModel\):\n    model_config = ConfigDict\(\n        extra='allow',\n    \)\n    roll_type: RollType",
        """EmbeddedMove = Annotated["EmbeddedActionRollMove | EmbeddedNoRollMove | EmbeddedProgressRollMove | EmbeddedSpecialTrackMove", Discriminator('roll_type')]""",
        content,
    )

    # Also fix existing union types that were already replaced but missing discriminator
    content = re.sub(
        r"contents: dict\[str, MoveActionRoll \| MoveNoRoll \| MoveProgressRoll \| MoveSpecialTrack\]",
        "contents: dict[str, Annotated[MoveActionRoll | MoveNoRoll | MoveProgressRoll | MoveSpecialTrack, Discriminator('roll_type')]]",
        content,
    )

    content = re.sub(
        r"contents: dict\[str, OracleTableText \| OracleTableText2 \| OracleTableText3\]",
        "contents: dict[str, Annotated[OracleTableText | OracleTableText2 | OracleTableText3, Discriminator('oracle_type')]]",
        content,
    )

    # Fix collections field to use a discriminated union of all oracle collection types
    # instead of the base OracleCollection (which has extra='allow')
    # The oracle_type field is used as discriminator
    oracle_collection_union = (
        "Annotated["
        "OracleTablesCollection | OracleTableSharedRolls | OracleTableSharedText | "
        "OracleTableSharedText2 | OracleTableSharedText3, "
        "Discriminator('oracle_type')]"
    )

    content = re.sub(
        r"collections: dict\[str, OracleCollection\]",
        f"collections: dict[str, {oracle_collection_union}]",
        content,
    )

    return content


def post_process(content: str) -> str:
    """Apply all post-processing fixes to generated models."""
    content = remove_empty_classes(content)
    content = replace_placeholder_types(content)
    content = replace_features_dangers_contextually(content)
    content = remove_date_pattern(content)
    content = convert_rootmodel_to_typealias(content)
    content = add_discriminated_unions(content)
    return content


def main():
    if len(sys.argv) < 2:
        print("Usage: python post_process_models.py <models.py>")
        sys.exit(1)

    models_path = Path(sys.argv[1])

    if not models_path.exists():
        print(f"Error: {models_path} does not exist")
        sys.exit(1)

    content = models_path.read_text()
    processed = post_process(content)

    if "--dry-run" in sys.argv:
        print(processed)
    else:
        models_path.write_text(processed)
        print(f"Post-processed {models_path}")


if __name__ == "__main__":
    main()
