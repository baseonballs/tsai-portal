#!/bin/bash
# Copy the Spotlight customer manual into src/content/docs/spotlight for the /docs route.
#
# Phase 156: this used to copy THREE trees — Spotlight's manual, Periodical's whole docs/
# directory and Watson's — and the Periodical/Watson trees were internal engineering material
# (architecture, runbooks, release notes) carrying operator identities, internal hostnames and the
# names of real users. Only Spotlight's customer manual is published now, and the copy is checked
# for contact details and internal identifiers before it can be packaged. Missing source or a
# failed check stops the build: a docs page that silently ships the wrong content is worse than a
# build that fails.
set -euo pipefail

PORTAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPOTLIGHT_DIR="${PORTAL_DIR}/../tsai-spotlight/src/content/spotlight-docs"
TARGET_DIR="${PORTAL_DIR}/src/content/docs"

if [ ! -d "$SPOTLIGHT_DIR" ]; then
  echo "✖ Spotlight manual not found at $SPOTLIGHT_DIR — refusing to build /docs without it." >&2
  exit 1
fi

rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}/spotlight"
cp -R "$SPOTLIGHT_DIR"/. "${TARGET_DIR}/spotlight/"
echo "✔ Copied Spotlight manual"

node "${PORTAL_DIR}/scripts/check-docs-content.mjs" "${TARGET_DIR}"
