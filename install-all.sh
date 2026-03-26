#!/bin/bash
# Install dependencies for all template projects
# Usage: ./install-all.sh

set -e

TEMPLATES=(
  "01-ecommerce"
  "02-blog"
  "03-portfolio"
  "04-landing-page"
  "05-saas"
  "06-booking"
  "07-restaurant"
  "08-real-estate"
  "09-clinic"
  "10-education"
)

ROOT=$(cd "$(dirname "$0")" && pwd)
SUCCESS=0
SKIP=0
FAIL=0

echo "========================================"
echo " Installing dependencies for all templates"
echo "========================================"
echo ""

for dir in "${TEMPLATES[@]}"; do
  path="$ROOT/$dir"
  if [ -f "$path/package.json" ]; then
    echo ">>> $dir"
    cd "$path"
    if npm install --silent 2>/dev/null; then
      echo "    OK"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "    FAILED"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "--- $dir (skip, no package.json)"
    SKIP=$((SKIP + 1))
  fi
done

echo ""
echo "========================================"
echo " Done: $SUCCESS installed | $SKIP skipped | $FAIL failed"
echo "========================================"
