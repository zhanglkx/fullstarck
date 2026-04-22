# syntax=docker/dockerfile:1.7

# ---------- 基础镜像 ----------
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    CI=true
RUN corepack enable \
  && corepack prepare pnpm@10.33.0 --activate \
  && apk add --no-cache libc6-compat

WORKDIR /app

# ---------- 依赖安装（利用缓存层） ----------
FROM base AS deps
# 先拷贝 workspace 声明 + 根锁文件
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
# 再按工作区结构拷贝各 package.json，最大化 layer 缓存
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------- 构建 ----------
FROM base AS builder
COPY --from=deps /app /app
COPY . .

# 先构建共享包（api 运行期依赖其 dist）
RUN pnpm --filter @fullstack/shared build \
  && pnpm --filter api build

# 裁剪为仅含生产依赖
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter api --prod deploy /app/out

# ---------- 运行时 ----------
FROM node:24-alpine AS runner
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

RUN apk add --no-cache tini wget \
  && addgroup -g 1001 -S nodejs \
  && adduser -S -u 1001 -G nodejs nestjs

COPY --from=builder --chown=nestjs:nodejs /app/out/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./package.json

USER nestjs
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
