# syntax=docker/dockerfile:1
# Production image lives at infra/builds/cloudrun/Dockerfile
#
#   docker build -f infra/builds/cloudrun/Dockerfile -t tsai-landing-page-v2:local .

FROM node:22-bookworm-slim
RUN echo "ERROR: use -f infra/builds/cloudrun/Dockerfile" && exit 1
