# GCP Cloud Run Deployment & OAuth Configuration

This directory contains the packaging, deployment scripts, and the configuration-as-code documentation for the `tsai-portal` Cloud Run deployment.

## Google OAuth Credentials Source of Truth (SoT)

Because standard Google Cloud external OAuth Client credentials cannot be managed programmatically via the Google Cloud Resource Manager API or Terraform, [oauth-google-console.yaml](file:///home/micon/dev/tsai/tsai-portal/infra/builds/cloudrun/oauth-google-console.yaml) serves as our **canonical Source of Truth (SoT)** for manual API console configuration.

Always keep [oauth-google-console.yaml](file:///home/micon/dev/tsai/tsai-portal/infra/builds/cloudrun/oauth-google-console.yaml) updated in version control when adding new local development hostnames, tailnet aliases, funnel gateways, or Cloud Run routing endpoints.

---

## Deployment Instructions

### Environment Prerequisites
Ensure the following environment variables are set (or fallback defaults will be used):
* `PROJECT_ID`: Target GCP Project ID (Default: `tsai-18832`)
* `REGION`: Target Google Cloud Region (Default: `us-west1`)
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Client Anonymous Key (Loaded from `.env.local` or environment)

### Run Deployment Pipeline
To deploy the application to GCP Cloud Run via Google Cloud Build, run the deployment script:
```bash
./deploy.sh
```

### Local Docker Build Dry Run
To package and build the Docker container locally (without submitting to GCP):
```bash
DEPLOY_VIA=local ./deploy.sh
```

---

## Runtime Details
* **Container Port**: `8080`
* **Output Mode**: `standalone` (Node.js standalone runtime)
* **Supabase Client Resolution**: Serves `/supabase` requests via the internal Next.js rewrite proxy to `TSAI_DGX_ORIGIN` (avoiding browser CORS).
