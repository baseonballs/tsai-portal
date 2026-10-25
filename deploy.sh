#!/usr/bin/env bash
# TSAI Portal Release Deploy Entrypoint
# Default is strictly DEPLOY_VIA=local (local docker build + push — $0 Cloud Build cost).
# Can be overridden via DEPLOY_VIA=cloudbuild if needed.
export DEPLOY_VIA="${DEPLOY_VIA:-local}"
exec "$(dirname "$0")/infra/builds/cloudrun/deploy.sh" "$@"
