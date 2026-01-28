#!/bin/bash
# Build everything in the correct order
# Run this after adding new content to ensure nothing is missed

set -e

echo "=== Datasworn Full Build ==="
echo ""

echo "1/4 Building JSON from source YAML..."
npm run build:json

echo ""
echo "2/4 Building Node.js packages..."
npm run build:pkg

echo ""
echo "3/4 Building Python package..."
uv run build.py --force

echo ""
echo "4/4 Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo "Uncommitted changes detected:"
    git status --short
    echo ""
    echo "Review and commit these changes before pushing."
else
    echo "Working tree clean."
fi

echo ""
echo "=== Build complete ==="
