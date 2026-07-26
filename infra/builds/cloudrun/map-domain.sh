#!/usr/bin/env bash
# Map hub.tsai-spotlight.com (or custom domain) to Cloud Run tsai-portal service.
#
# Environment variables:
#   PROJECT_ID     (default: tsai-18832)
#   REGION         (default: us-west1)
#   SERVICE        (default: tsai-portal)
#   DOMAIN         (default: hub.tsai-spotlight.com)
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

PROJECT_ID="${PROJECT_ID:-tsai-18832}"
REGION="${REGION:-us-west1}"
SERVICE="${SERVICE:-tsai-portal}"
DOMAIN="${DOMAIN:-hub.tsai-spotlight.com}"

echo "→ Configuring domain mapping for $DOMAIN..."
echo "  • Project: $PROJECT_ID"
echo "  • Region:  $REGION"
echo "  • Service: $SERVICE"
echo "  • Domain:  $DOMAIN"

gcloud config set project "$PROJECT_ID" >/dev/null

# Check if domain mapping currently exists
EXISTING_SERVICE="$(gcloud beta run domain-mappings list \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(SERVICE)" \
  --filter="DOMAIN=$DOMAIN" || true)"

if [[ -n "$EXISTING_SERVICE" ]]; then
  if [[ "$EXISTING_SERVICE" == "$SERVICE" ]]; then
    echo "✅ Domain $DOMAIN is already mapped to $SERVICE."
  else
    echo "⚠️ Domain $DOMAIN is currently mapped to '$EXISTING_SERVICE'."
    echo "→ Deleting old domain mapping..."
    gcloud beta run domain-mappings delete \
      --domain="$DOMAIN" \
      --region="$REGION" \
      --project="$PROJECT_ID" \
      --quiet
  fi
fi

if [[ "$EXISTING_SERVICE" != "$SERVICE" ]]; then
  echo "→ Creating new domain mapping: $DOMAIN → $SERVICE..."
  gcloud beta run domain-mappings create \
    --service="$SERVICE" \
    --domain="$DOMAIN" \
    --region="$REGION" \
    --project="$PROJECT_ID"
fi

echo ""
echo "✅ Domain mapping configured!"
echo "👉 Domain: https://$DOMAIN"
echo "👉 CNAME target: ghs.googlehosted.com."
echo ""
echo "Verify status with:"
echo "  gcloud beta run domain-mappings describe --domain=$DOMAIN --region=$REGION --project=$PROJECT_ID"
