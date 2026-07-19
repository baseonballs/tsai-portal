# syntax=docker/dockerfile:1
# Production Next.js standalone image for Google Cloud Run (PORT 8080).
# Build from repository root:
#   docker build -f infra/builds/cloudrun/Dockerfile -t tsai-portal:local .

ARG NODE_VERSION=22-bookworm

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV TSAI_DEPLOY_TARGET=cloudrun
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public env (Next inlines NEXT_PUBLIC_* at compile time).
ARG NEXT_PUBLIC_SUPABASE_URL=
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=
ARG TSAI_DGX_ORIGIN=
ARG API_GATEWAY_URL=

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_TSAI_DGX_ORIGIN=${TSAI_DGX_ORIGIN}
ENV TSAI_DGX_ORIGIN=${TSAI_DGX_ORIGIN}
ENV API_GATEWAY_URL=${API_GATEWAY_URL}

RUN pnpm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS=--max-http-header-size=131072

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER node
EXPOSE 8080
CMD ["node", "server.js"]
