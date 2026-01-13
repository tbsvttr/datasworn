"""
Post-processing script for generated Pydantic models.

The datamodel-code-generator has limitations with certain JSON Schema constructs:
1. allOf with tuple types generates empty placeholder classes
2. Pattern + format on date fields causes validation issues

This script fixes these issues automatically after generation.
"""

import re
import sys
from pathlib import Path


# Classes that should be removed (empty placeholders from allOf)
EMPTY_CLASSES_TO_REMOVE = [
    "Denizens",
    "Features",
    "Dangers",
]

# Type replacements: placeholder -> actual type
TYPE_REPLACEMENTS = {
    "list[Denizens]": "list[DelveSiteDenizen]",
    "list[Features]": "list[DelveSiteDomainFeature]",
    "list[Dangers]": "list[DelveSiteDomainDanger]",
}


def remove_empty_classes(content: str) -> str:
    """Remove empty placeholder classes generated from allOf constructs."""
    for class_name in EMPTY_CLASSES_TO_REMOVE:
        # Match: class ClassName(BaseModel):\n    pass\n\n
        pattern = rf"^class {class_name}\(BaseModel\):\n    pass\n\n\n"
        content = re.sub(pattern, "", content, flags=re.MULTILINE)
    return content


def replace_placeholder_types(content: str) -> str:
    """Replace placeholder types with actual types."""
    for placeholder, actual in TYPE_REPLACEMENTS.items():
        content = content.replace(placeholder, actual)
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


def post_process(content: str) -> str:
    """Apply all post-processing fixes to generated models."""
    content = remove_empty_classes(content)
    content = replace_placeholder_types(content)
    content = remove_date_pattern(content)
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
