# /// script
# name = "python-datasworn"
# version = "0.1.0"
# description = "Datasworn Python packages"
# readme = "README.md"
# requires-python = ">=3.14"
# dependencies = [
#     "datamodel-code-generator[http]>=0.53.0",
#     "rich>=14.2.0",
# ]
# ///

import argparse
import logging
import re
import shutil
from pathlib import Path
from typing import Any

import tomllib
from datamodel_code_generator import (
    DataModelType,
    InputFileType,
    PythonVersion,
    generate,
)
from rich import print
from rich.logging import RichHandler
from rich.syntax import Syntax

REGEX = r"(?m)^# /// (?P<type>[a-zA-Z0-9-]+)$\s(?P<content>(^#(| .*)$\s)+)^# ///$"

FORMAT = "%(message)s"
log = logging.getLogger(__name__)


PKG_ROOT = Path(__file__).parent / "pkg" / "python"
ROOT_OUTPUT = Path(__file__).parent / "datasworn"
VERSION = "0.1.0"

PKG_SCOPE_OFFICIAL = "datasworn"
PKG_SCOPE_COMMUNITY = "datasworn-community-content"

# Keys are JSON source names (with underscores)
# pkg_dir is the Python package directory name (with hyphens for community packages)
PKG_CONFIG = {
    "classic": {"scope": PKG_SCOPE_OFFICIAL},
    "delve": {"scope": PKG_SCOPE_OFFICIAL},
    "starforged": {"scope": PKG_SCOPE_OFFICIAL},
    "sundered_isles": {"scope": PKG_SCOPE_OFFICIAL},
    "ancient_wonders": {"scope": PKG_SCOPE_COMMUNITY, "pkg_dir": "ancient-wonders"},
    "fe_runners": {"scope": PKG_SCOPE_COMMUNITY, "pkg_dir": "fe-runners"},
    "starsmith": {"scope": PKG_SCOPE_COMMUNITY},
}


def snake(name: str):
    return re.sub(r"[-]+", "_", name).lower()


def read(script: str) -> dict[str, Any]:
    """Read script metadata https://peps.python.org/pep-0723/"""
    name = "script"
    matches = list(
        filter(lambda m: m.group("type") == name, re.finditer(REGEX, script))
    )
    content = "".join(
        line[2:] if line.startswith("# ") else line[1:]
        for line in matches[0].group("content").splitlines(keepends=True)
    )
    return tomllib.loads(content)


def copy_json(args):
    print(args)
    log.info("Datasworn Python package builder")
    log.info(f"PKG_ROOT: {PKG_ROOT}\nROOT_OUTPUT: {ROOT_OUTPUT}\n")

    for pkg in PKG_CONFIG:
        log.info(f"Copying {pkg} JSON...")
        pkg_config = PKG_CONFIG[pkg]
        scope = pkg_config["scope"]
        sscope = snake(scope)
        # Use pkg_dir if specified, otherwise use the key name
        pkg_dir = pkg_config.get("pkg_dir", pkg)
        pkg_root = PKG_ROOT / scope / "src" / scope / pkg_dir / "src" / sscope / snake(pkg_dir)
        pkg_json_dest = pkg_root / "json"
        json_src = ROOT_OUTPUT / pkg / f"{pkg}.json"

        if not args.dry_run:
            pkg_json_dest.mkdir(exist_ok=True, parents=True)
        else:
            log.info(f"Would create {pkg_json_dest}")

        if args.force:
            for f in pkg_json_dest.iterdir():
                if not args.dry_run:
                    f.unlink()
                else:
                    log.info(f"Would delete {f}")

        if not args.dry_run:
            shutil.copy(json_src, pkg_json_dest)
        else:
            log.info(f"Would copy {json_src} to {pkg_json_dest}")

        # log.info("Building package...")
        # build_content_package(pkg_config)


def build_core_package(args):
    log.info("Generating Pydantic models...")

    json_schema = ROOT_OUTPUT / "datasworn.schema.json"
    output = (
        PKG_ROOT
        / "datasworn"
        / "src"
        / "datasworn"
        / "core"
        / "src"
        / "datasworn"
        / "core"
        / "models.py"
    )

    result = generate(
        json_schema,
        input_file_type=InputFileType.JsonSchema,
        output_model_type=DataModelType.PydanticV2BaseModel,
        # output=output,
        # extra_fields="allow",
        use_standard_collections=True,
        field_constraints=True,
        use_annotated=True,
        target_python_version=PythonVersion.PY_313,
        # disable_future_imports=True,
        # use_pendulum=True,
    )

    if args.dry_run:
        print(Syntax(result, "python"))
    else:
        with open(output, "w") as f:
            log.info(f"Writing {output}")
            f.write(result)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Datasworn Python package builder")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--log-level", default="info", help="Logging level")
    args = parser.parse_args()

    logging.basicConfig(
        level=args.log_level.upper(),
        format=FORMAT,
        datefmt="[%X]",
        handlers=[RichHandler()],
    )

    with open(__file__) as f:
        script = read(f.read())
        print(script)

    copy_json(args)
    build_core_package(args)
