# TSAI Portal

The public landing page, interactive multi-application documentation portal, and athlete/coach entry portal for the TSAI Spark platform.

## Getting Started

### 1. Prerequisites
Ensure you have the latest `pnpm` installed and have generated the local `.env.local` configuration.

### 2. Sibling Repositories Documentation Federation
The portal bundles documentation from sibling repositories (`tsai-spotlight`, `tsai-periodical`, and `tsai-watson`). To build or run the portal, copy these docs into the workspace:
```bash
pnpm run build
```

### 3. Run Development Server
```bash
pnpm dev
```
The application will start on `http://localhost:3040`.

---

## Infrastructure & Deployments

For instructions on deploying the application to Google Cloud Run, custom DNS/domain proxying, and configuring Google Cloud Console OAuth 2.0 Credentials, please refer to the dedicated infrastructure documentation:

👉 **[Cloud Run Deployment & OAuth Configuration Guide](file:///home/micon/dev/tsai/tsai-portal/infra/builds/cloudrun/README.md)**

* The canonical **Source of Truth (SoT)** for Google Console OAuth Allowed Origins and Redirect URIs is defined in **[oauth-google-console.yaml](file:///home/micon/dev/tsai/tsai-portal/infra/builds/cloudrun/oauth-google-console.yaml)**.
