# syntax=docker/dockerfile:1.7

# ---------- builder ----------
FROM node:24-alpine AS builder

WORKDIR /app

# GITHUB_TOKEN is used at build time so the GHCR package list (/agents,
# /binaries) and the live Agentspec markdown can be fetched from the GitHub
# API. Without it, the pages render the baked-in fallback content.
ARG GITHUB_TOKEN=""
ENV GITHUB_TOKEN=$GITHUB_TOKEN

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---------- runtime ----------
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["server.js"]
