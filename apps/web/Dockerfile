# syntax=docker/dockerfile:1.7

# ---------- 基础镜像 ----------
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    CI=true \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable \
  && corepack prepare pnpm@10.33.0 --activate \
  && apk add --no-cache libc6-compat

WORKDIR /app

# ---------- 依赖安装 ----------
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------- 构建 ----------
FROM base AS builder
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=deps /app /app
COPY . .

RUN pnpm --filter @fullstack/shared build \
  && pnpm --filter web build

# ---------- 运行时 ----------
FROM node:24-alpine AS runner
ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN apk add --no-cache tini \
  && addgroup -g 1001 -S nodejs \
  && adduser -S -u 1001 -G nodejs nextjs

# Next.js standalone 产物已经包含精简的 node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3001

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/web/server.js"]
