#!/usr/bin/env bash
# Build TSAI Landing Page → Google Artifact Registry → Cloud Run.
#
# Environment variables:
#   PROJECT_ID     (default: tsai-18832)
#   REGION         (default: us-west1)
#   SERVICE        (default: tsai-portal)
#   IMAGE_NAME     (default: tsai-portal)
#   DEPLOY_VIA     "cloudbuild" (default) or "local"
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

read_app_version() {
  if [[ ! -f "$ROOT/VERSION" ]]; then
    echo "ERROR: missing root VERSION file — create one before deploy" >&2
    exit 1
  fi
  tr -d '[:space:]' < "$ROOT/VERSION"
}

APP_VERSION="$(read_app_version)"

# Docker tags allow [a-zA-Z0-9_][a-zA-Z0-9._-]{0,127}
DOCKER_VERSION_TAG="${APP_VERSION//\//-}"

PROJECT_ID="${PROJECT_ID:-tsai-18832}"
REGION="${REGION:-us-west1}"
SERVICE="${SERVICE:-tsai-portal}"
IMAGE_NAME="${IMAGE_NAME:-tsai-portal}"
DEPLOY_VIA="${DEPLOY_VIA:-cloudbuild}"

TSAI_DGX_ORIGIN="${TSAI_DGX_ORIGIN:-https://spark-62db.tail18f71b.ts.net:8443}"
NEXT_PUBLIC_SUPABASE_URL="${TSAI_DGX_ORIGIN}/supabase"
API_GATEWAY_URL="${TSAI_DGX_ORIGIN}"

if [[ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" && -f "$ROOT/.env.local" ]]; then
  NEXT_PUBLIC_SUPABASE_ANON_KEY="$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' "$ROOT/.env.local" | cut -d= -f2- || true)"
fi

: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?Set NEXT_PUBLIC_SUPABASE_ANON_KEY or add it to .env.local}"

echo "→ project=$PROJECT_ID region=$REGION service=$SERVICE"
echo "→ app_version=$APP_VERSION (docker tag: $DOCKER_VERSION_TAG)"
echo "→ image=${REGION}-docker.pkg.dev/${PROJECT_ID}/tsai-frontends/${IMAGE_NAME}"
echo "→ dgx_origin=$TSAI_DGX_ORIGIN"
echo "→ supabase_url=$NEXT_PUBLIC_SUPABASE_URL"
echo "→ api_gateway_url=$API_GATEWAY_URL"

# Ensure latest documentation is copied into workspace prior to packaging
if [[ -f "./scripts/copy-docs.sh" ]]; then
  echo "→ Copying docs from sibling repos before build..."
  bash ./scripts/copy-docs.sh
fi

gcloud config set project "$PROJECT_ID" >/dev/null

echo "→ Enabling APIs…"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com >/dev/null

if [[ "$DEPLOY_VIA" == "local" ]]; then
  IMAGE_REF="${REGION}-docker.pkg.dev/${PROJECT_ID}/tsai-frontends/${IMAGE_NAME}"
  
  echo "→ Local docker build → $IMAGE_REF (linux/amd64 for Cloud Run)"
  
  gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet >/dev/null
  
  docker build \
    --platform linux/amd64 \
    -f infra/builds/cloudrun/Dockerfile \
    --build-arg "TSAI_DGX_ORIGIN=${TSAI_DGX_ORIGIN}" \
    --build-arg "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}" \
    --build-arg "NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" \
    --build-arg "API_GATEWAY_URL=${API_GATEWAY_URL}" \
    -t "${IMAGE_REF}:latest" \
    -t "${IMAGE_REF}:${DOCKER_VERSION_TAG}" \
    .
    
  docker push "${IMAGE_REF}:latest"
  docker push "${IMAGE_REF}:${DOCKER_VERSION_TAG}"
  
  gcloud run services update "$SERVICE" \
    --region="$REGION" \
    --image="${IMAGE_REF}:${DOCKER_VERSION_TAG}" \
    --quiet
    
else
  echo "→ Cloud Build (Artifact Registry push + Cloud Run deploy)…"
  gcloud builds submit \
    --config=infra/builds/cloudrun/cloudbuild.yaml \
    --substitutions="_IMAGE_NAME=${IMAGE_NAME},_SERVICE_NAME=${SERVICE},_RUN_REGION=${REGION},_TSAI_DGX_ORIGIN=${TSAI_DGX_ORIGIN},_NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL},_NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-},_API_GATEWAY_URL=${API_GATEWAY_URL},_APP_VERSION=${DOCKER_VERSION_TAG}" \
    .
fi

URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')"
echo ""
echo "✅ Deployed: $URL"
echo "👉 Version: $APP_VERSION"
echo "👉 Canonical Cloud Run URL (use for OAuth): $URL"
