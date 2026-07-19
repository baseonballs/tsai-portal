#!/bin/bash
# Copy documentation from sibling directories if they exist, or log warning.

PORTAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPOTLIGHT_DIR="${PORTAL_DIR}/../tsai-spotlight/src/content/spotlight-docs"
PERIODICAL_DIR="${PORTAL_DIR}/../tsai-periodical/docs"
WATSON_DIR="${PORTAL_DIR}/../tsai-watson/docs"

TARGET_DIR="${PORTAL_DIR}/src/content/docs"

rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}/spotlight"
mkdir -p "${TARGET_DIR}/periodical"
mkdir -p "${TARGET_DIR}/watson"

echo "Copying documentation from sibling repositories..."

if [ -d "$SPOTLIGHT_DIR" ]; then
  cp -R "$SPOTLIGHT_DIR"/* "${TARGET_DIR}/spotlight/"
  echo "✔ Copied Spotlight docs"
else
  echo "⚠ Warning: Spotlight docs source not found at $SPOTLIGHT_DIR"
fi

if [ -d "$PERIODICAL_DIR" ]; then
  cp -R "$PERIODICAL_DIR"/* "${TARGET_DIR}/periodical/"
  echo "✔ Copied Periodical docs"
else
  echo "⚠ Warning: Periodical docs source not found at $PERIODICAL_DIR"
fi

if [ -d "$WATSON_DIR" ]; then
  cp -R "$WATSON_DIR"/* "${TARGET_DIR}/watson/"
  echo "✔ Copied Watson docs"
else
  echo "⚠ Warning: Watson docs source not found at $WATSON_DIR"
fi

echo "Documentation copy completed."
