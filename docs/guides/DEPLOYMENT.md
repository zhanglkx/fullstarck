# 全栈项目服务器部署实战指南

本文记录将本 pnpm monorepo（NestJS API + Next.js Web + PostgreSQL + Redis）部署到阿里云 ECS 的完整过程，包含 SSH 连接、Docker 安装、镜像构建、Nginx 反向代理、安全加固，以及部署中遇到的全部真实问题与修复方案。

目标读者：需要把类似全栈项目部署到国内云服务器的开发者。所有命令、配置均来自真实部署，可直接复用。

---

## 0. 部署架构总览

最终架构：Nginx 作为唯一公网入口（80 端口），其余服务全部收敛到宿主机本地回环，互相通过 Docker 内网通信。

```
                      阿里云安全组（仅放行 80 + SSH:22）
                                  │
公网用户 ──HTTP:80──►  ┌──────────────────────┐
                       │   nginx (容器)        │  0.0.0.0:80
                       │   统一入口/反向代理    │
                       └──────────┬───────────┘
                                  │ Docker 内网 app-network
                 ┌────────────────┼────────────────┐
                 │ /              │ /api/           │ /api/socket.io (WS)
                 ▼                ▼                 ▼
         ┌──────────────┐  ┌──────────────┐
         │ web:3001     │  │ api:3000     │ 127.0.0.1 only
         │ Next.js      │  │ NestJS       │
         └──────┬───────┘  └──────┬───────┘
                │ SSR/RSC          │
                │ http://api:3000  ├──────────┬──────────┐
                └──────────────────┘          ▼          ▼
                                       ┌────────────┐ ┌──────────┐
                                       │ postgres   │ │ redis    │ 127.0.0.1 only
                                       │ :5432      │ │ :6379    │
                                       └────────────┘ └──────────┘
```

关键设计点：

- **唯一入口**：只有 nginx 监听 `0.0.0.0:80`，api/web/postgres/redis 全部绑定 `127.0.0.1`，公网无法直连。
- **同源访问**：浏览器所有请求（页面、REST、SSE、WebSocket）都走 80 端口，API 走 `/api` 前缀，无跨域问题。
- **两条后端访问路径**：
  - 浏览器端（客户端组件、SSE、WebSocket）→ 同源 `/api` → Nginx → api
  - 服务端渲染（SSR/RSC）→ Docker 内网 `http://api:3000`（容器间直连，不经公网）

---

## 1. SSH 连接服务器

### 1.1 内网 IP vs 公网 IP（高频踩坑）

云服务器通常有两个 IP：

- **内网 IP**（如 `172.19.128.240`）：VPC 内地址，`172.16.0.0/12`、`10.0.0.0/8`、`192.168.0.0/16` 网段，**从外部无法访问**。
- **公网 IP**（如 `8.159.144.140`）：弹性公网地址，从控制台「实例详情」查看，外部连接必须用这个。

误用内网 IP 连接会直接超时：

```bash
ssh root@172.19.128.240
# Connection timed out during banner exchange / port 22 timed out
```

排查命令：

```bash
ping -c 3 172.19.128.240    # 不通说明网络层不可达
```

### 1.2 安全组要放行「本机公网出口 IP」，不是内网 IP

安全组白名单里要填的是**你本机的公网出口 IP**，而不是你本机的局域网 IP。查询方式：

```bash
# 本机局域网 IP（不要填这个到云端安全组）
ifconfig | grep "inet " | grep -v 127.0.0.1
# 输出示例：inet 192.168.1.22 ...

# 本机公网出口 IP（填这个到安全组）
curl -s ifconfig.me
# 输出示例：185.151.146.146
```

> 注意：公网出口 IP 可能随网络环境（切 WiFi、重拨号）变化，连不上时先重新查一遍。

### 1.3 SSH 握手被拒（连接已通但被关闭）

```bash
ssh root@<公网IP>
# kex_exchange_identification: Connection closed by remote host
# Connection closed by ... port 22
```

这说明 TCP 已通（安全组放行了），但 SSH 协议握手被拒。常见原因：用了内网 IP、缺少认证密钥、或服务器侧限制。改用正确公网 IP + 密钥即可。

### 1.4 使用密钥连接

阿里云实例通常用 `.pem` 密钥。本机已有密钥时直接指定：

```bash
ssh -i ~/.ssh/aliyun_key.pem root@8.159.144.140
```

### 1.5 Host key 变更警告

同一公网 IP 之前绑过别的实例时会报：

```
WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!
```

清理旧记录即可：

```bash
ssh-keygen -R 8.159.144.140
```

---

## 2. 服务器环境准备

系统：Alibaba Cloud Linux 4（兼容 RHEL，使用 dnf/yum）。

### 2.1 检查资源（内存是关键）

```bash
free -h          # 内存
df -h /          # 磁盘
arch             # 架构 x86_64
```

本次实例内存仅 **1.6GB 且无 swap** —— 这是后面 Next.js 构建 OOM 的直接原因。

### 2.2 添加 Swap（强烈建议）

小内存机器务必加 swap，否则构建/高负载时系统会 OOM 卡死：

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab   # 开机自动挂载
free -h                                            # 确认 Swap 行
```

---

## 3. 安装 Docker（国内源）

### 3.1 添加阿里云 docker-ce 源

```bash
dnf install -y dnf-plugins-core
dnf config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

### 3.2 固定 releasever（Alibaba Cloud Linux 4 专属坑）

docker-ce.repo 里用了 `$releasever` 变量，Alibaba Cloud Linux 4 解析成 `4`，但阿里云镜像里 centos 目录只有 7/8/9，会导致 404。

**错误做法**（会让系统自带源也变成 9 而报错）：

```bash
dnf install -y --releasever=9 docker-ce ...   # ❌ alinux4-os 源 404
```

**正确做法**：只把 docker repo 文件里的 `$releasever` 替换成 9：

```bash
sed -i 's/\$releasever/9/g' /etc/yum.repos.d/docker-ce.repo
```

### 3.3 安装并启动

```bash
dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
systemctl is-active docker      # active
docker version
```

### 3.4 配置镜像加速器（必须，否则拉 Docker Hub 极慢/失败）

```bash
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me",
    "https://docker.m.daocloud.io"
  ],
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
EOF
systemctl restart docker
docker info | grep -A4 "Registry Mirrors"   # 确认已加载
docker pull hello-world                       # 验证可拉取
```

> `log-opts` 限制容器日志大小，避免日志撑爆磁盘。

### 3.5 个别镜像加速器拉不动时，换源 + 重打 tag

部署中遇到 `postgres:16-alpine` 在加速器上拉取卡住数分钟。解决办法：用 daocloud 全限定名拉，再重打成 compose 期望的 tag。

```bash
docker pull docker.m.daocloud.io/library/postgres:16-alpine
docker tag docker.m.daocloud.io/library/postgres:16-alpine postgres:16-alpine
```

---

## 4. 上传代码

### 4.1 优先用 Git Clone（而非 rsync 整个目录）

本地项目排除 node_modules 后仍有 7GB+（`apps/mobile` 的 Expo 缓存占大头）。直接传整个目录又慢又脏。**公开仓库直接在服务器 clone 最干净**：

```bash
dnf install -y git
git clone --branch <分支> --depth 1 https://github.com/<user>/<repo>.git /opt/fullstack
```

- `--depth 1`：浅克隆，只取最新提交，省时省空间。
- clone 前先确认本地改动已 push，否则服务器拉到的是旧代码。
- 私有仓库需配置 token 或 deploy key。

### 4.2 .dockerignore 要排除大目录

构建上下文会被发送给 Docker，确保 `.dockerignore` 排除了 `**/node_modules`、`**/.next`、`**/.expo`、移动端资源等，否则构建奇慢。

---

## 5. 镜像构建：本地构建 vs 服务器构建

### 5.1 服务器内存不足导致 Next.js 构建 OOM（核心难题）

在 1.6GB 内存的服务器上直接 `docker compose build`，Next.js 16 (Turbopack) 生产构建阶段会吃光内存 + swap，系统陷入剧烈 thrashing，**SSH 完全无响应，最终需强制重启实例**。

现象：构建卡在 `Creating an optimized production build ...` 不动，之后 SSH 连接超时。

加 swap 到 2GB 仍不够。两种根本解法：

| 方案                                     | 适用                        | 代价                               |
| ---------------------------------------- | --------------------------- | ---------------------------------- |
| 加大 swap 到 6GB+                        | 不想动镜像，原生 amd64 构建 | 构建慢（走磁盘），仍可能 thrashing |
| **本地构建镜像后传到服务器**（本次采用） | Mac/PC 内存充足             | 跨架构 + 镜像传输耗时              |
| 升级实例内存到 4GB+                      | 最稳妥                      | 需停机，可能产生费用               |

### 5.2 跨架构构建（Apple Silicon → x86_64 服务器）

Mac（arm64）构建的镜像无法在 x86_64 服务器运行，必须用 buildx 指定平台：

```bash
docker buildx build --platform linux/amd64 \
  -f apps/api/Dockerfile -t fullstack/api:latest --load .

docker buildx build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  -f apps/web/Dockerfile -t fullstack/web:latest --load .
```

- `--platform linux/amd64`：通过 QEMU 模拟构建目标架构（比原生慢，但本机内存足够，不会 OOM）。
- `--load`：构建结果加载到本地 Docker 镜像列表。
- `--build-arg NEXT_PUBLIC_API_URL=/api`：见第 7 节，前端同源访问的关键。

### 5.3 本地 Docker 也要配镜像加速器

本机（国内）构建时拉 `docker/dockerfile:1.7`、`node:24-alpine` 同样会失败（`registry-1.docker.io: EOF`）。给 Docker Desktop 配加速器：编辑 `~/.docker/daemon.json` 加入 `registry-mirrors`（同 3.4），然后**重启 Docker Desktop**。

> Docker Desktop 偶尔会卡在 "Starting" 启动不起来。强杀进程后重开可解决：
> `pkill -9 -f "Docker Desktop"` 然后 `open -a Docker`。

### 5.4 传输镜像到服务器（SSH 流式，无需中转文件）

```bash
docker save fullstack/api:latest fullstack/web:latest \
  | gzip \
  | ssh -i ~/.ssh/aliyun_key.pem root@8.159.144.140 "gunzip | docker load"
```

`save | gzip | ssh "gunzip | docker load"` 一条管道完成「导出→压缩→传输→解压→导入」，不落地中间文件。

---

## 6. 构建期遇到的代码 / 配置问题

### 6.1 pnpm 10 deploy 报错 ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE

pnpm v10 起 `pnpm deploy` 默认只对设置了 `inject-workspace-packages=true` 的 workspace 生效。api Dockerfile 里的裁剪命令报错。

修复：deploy 命令加 `--legacy`：

```dockerfile
# apps/api/Dockerfile
RUN pnpm --filter api --prod deploy --legacy /app/out
```

### 6.2 Next.js 构建期拉 Google Fonts 失败

`next/font/google` 会在**构建时**从 Google Fonts 下载字体，国内网络失败导致构建中断：

```
next/font: error: Failed to fetch `Geist Mono` from Google Fonts.
```

修复：改用 Vercel 的 `geist` npm 包（字体内置打包，无需联网）。CSS 变量名一致，drop-in 替换：

```bash
pnpm --filter web add geist
```

```tsx
// layout.tsx
// 改前：import { Geist, Geist_Mono } from "next/font/google";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
const geistSans = GeistSans; // .variable 默认即 --font-geist-sans
const geistMono = GeistMono; // .variable 默认即 --font-geist-mono
```

> 凡是用了 `next/font/google` 的项目，部署到无法访问 Google 的环境都会踩这个坑。

### 6.3 TypeScript 类型错误中断构建

`next build` 包含类型检查，一处 `Partial<T>` 不匹配导致失败。服务端按模块增量推送的数据本就是部分字段，前端 state 类型应为 `Partial` 并合并：

```ts
// 改前：const [data, setData] = useState<RealtimeMonitorData | null>(null);
const [data, setData] = useState<Partial<RealtimeMonitorData> | null>(null);

// 收到增量推送时合并而非覆盖
setData((prev) => ({ ...prev, ...message.payload }));
```

> 教训：本地若跳过了 `next build`（只跑 dev），类型错误会在生产构建时才暴露。部署前先本地 `pnpm --filter web build` 验证。

---

## 7. Nginx 反向代理 + 同源访问（关键设计）

### 7.1 为什么要上 Nginx 反代

初版部署是「前端 `:3001`、后端 `:3000` 都裸暴露公网，前端用 `NEXT_PUBLIC_API_URL=http://IP:3000` 直连后端」。能跑，但有三个问题：

1. **多端口暴露**：3000/3001 都要开公网，攻击面大。
2. **跨域**：浏览器从 `:3001` 访问 `:3000` 是跨域，依赖后端 CORS 白名单，容易出错。
3. **不专业**：用户要记端口号，无法统一加 HTTPS。

**思考：反向代理的本质是「收口」**——把多个内部服务收敛到一个对外入口。一个入口意味着一处鉴权、一处限流、一处 TLS、一处日志、最小攻击面。这是生产部署的通用模式，不只为了好看。

### 7.2 为什么必须用 `/api` 前缀（而不是按路径直接分发）

本项目后端控制器路由是 `/serverstate`、`/npmdata`、`/qrcode` 等，**没有全局前缀**。而前端页面路由**恰好也有** `/serverstate`、`/npmdata`、`/qrcode`（导航菜单页）。

如果 Nginx 按裸路径分发，`/serverstate`（网页）和 `/serverstate/status`（API）无法可靠区分——这是**命名空间冲突**。

**思考：路由设计阶段就该给 API 加统一前缀（如 `/api`）**，把前端路由和后端路由放进不同命名空间，从根上避免歧义。本项目后端没加前缀，所以在 Nginx 层用 `/api/` 前缀人为隔离，转发时再剥离。这是一种「亡羊补牢」，但能解决问题。

### 7.3 Nginx 配置（docker/nginx/conf.d/default.conf）

```nginx
# WebSocket 升级所需的 Connection 头映射
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name _;
    client_max_body_size 20m;

    # 用 Docker 内嵌 DNS 解析上游服务名，避免容器重建后 IP 变化导致 502
    resolver 127.0.0.11 valid=30s ipv6=off;

    # 后端 API（REST / SSE / WebSocket），剥离 /api 前缀后转发
    location /api/ {
        set $api_target api:3000;
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://$api_target;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE / 长连接：关闭缓冲并延长超时
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # 前端 Next.js
    location / {
        set $web_target web:3001;
        proxy_pass http://$web_target;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

逐条说明「为什么」：

- **`resolver 127.0.0.11` + `set $api_target` 变量写法**：Nginx 默认在启动时一次性解析 `proxy_pass` 里的域名并缓存 IP。容器重建后 IP 会变，导致 502。把上游放进**变量**并配置 Docker 内嵌 DNS（`127.0.0.11`）会强制运行时动态解析，规避「容器重建后 502」这个经典坑。
- **`map $http_upgrade $connection_upgrade`**：WebSocket 握手需要 `Connection: upgrade` 头。用 map 在普通请求时设为 `close`、升级请求时设为 `upgrade`，一份配置同时兼容普通 HTTP 和 WS。
- **`rewrite ^/api/(.*)$ /$1 break`**：剥离 `/api` 前缀。浏览器请求 `/api/serverstate/status`，转发到后端变成 `/serverstate/status`（后端没有 `/api` 前缀）。
- **`proxy_buffering off`（SSE 关键）**：SSE 是服务端持续推流。Nginx 默认会缓冲响应，导致 SSE 数据被攒着不下发、前端收不到实时更新。必须关闭缓冲。
- **`proxy_read_timeout 3600s`**：SSE/WebSocket 是长连接，默认 60s 超时会把连接掐断，需调长。
- **`X-Forwarded-*` 头**：把真实客户端 IP、协议透传给后端，否则后端日志里全是 Nginx 容器的内网 IP。

### 7.4 compose 中加入 nginx 服务

```yaml
nginx:
  image: nginx:1.27-alpine
  container_name: fullstack-nginx
  restart: unless-stopped
  ports:
    - '${NGINX_PORT:-80}:80' # 唯一对公网暴露的服务
  volumes:
    - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
  depends_on:
    - web
    - api
  networks:
    - app-network
```

> 配置文件用 volume 挂载（`:ro` 只读），改配置后 `docker compose restart nginx` 即可生效，无需重建镜像。

---

## 8. WebSocket 与 SSE 经反代的同源改造

后端 API 有三类调用，反代后都要走同源 `/api`：

| 类型      | 技术        | 路径                                        |
| --------- | ----------- | ------------------------------------------- |
| REST      | axios       | `/api/serverstate/status` 等                |
| SSE       | EventSource | `/api/serverstate/stream`                   |
| WebSocket | socket.io   | namespace `/monitor`，path `/api/socket.io` |

### 8.1 统一入口地址：构建期注入 `/api`

Web 镜像构建时注入 `NEXT_PUBLIC_API_URL=/api`（相对路径）。这样浏览器端所有请求都打到同源 `/api`，由 Nginx 分发。

**思考：`NEXT_PUBLIC_*` 变量是构建期烤进浏览器 bundle 的**，运行时改环境变量无效。这就是为什么改它必须重新构建 web 镜像。初版误设成 `http://IP:3000`，导致浏览器直连 3000，怎么改 compose 运行时变量都不生效——必须重建。

### 8.2 SSE 改造

```ts
// EventSource 支持相对路径，NEXT_PUBLIC_API_URL=/api 时自动走同源
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const url = `${apiUrl}/serverstate/stream`; // → /api/serverstate/stream
```

### 8.3 WebSocket（socket.io）改造

socket.io 默认连 `/socket.io/`，要让它经 `/api/` 反代，需同时改 URL 和 path：

```ts
const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const isProxyPath = apiBase.startsWith('/'); // "/api" → true
const socketUrl = isProxyPath
  ? `${window.location.origin}/monitor` // 同源 + namespace
  : `${apiBase}/monitor`;
const socketPath = isProxyPath ? '/api/socket.io' : '/socket.io';

const socket = io(socketUrl, {
  path: socketPath,
  transports: ['websocket', 'polling'],
});
```

**思考：socket.io 的 namespace 和 path 是两个不同概念。** namespace（`/monitor`）是应用层逻辑分组；path（`/socket.io`）是底层 HTTP 端点。经 Nginx `/api/` 剥离后，客户端的 `/api/socket.io` 到后端变成 `/socket.io`，正好匹配后端默认 path——所以**后端 socket.io 无需改动**。

### 8.4 后端 CORS 支持环境变量

同源之后理论上不需要 CORS，但为保险（及 WS 握手）把生产源加入白名单，用环境变量管理而非硬编码：

```ts
// main.ts
app.enableCors({
  origin: [
    'http://localhost:3001',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
  ],
  credentials: true,
});
```

WebSocket Gateway 同理加 `CORS_ORIGIN` 支持。compose 里通过 `CORS_ORIGIN: ${PUBLIC_ORIGIN:-http://你的IP}` 注入。

**思考：环境相关的配置（域名、源）绝不硬编码**，用环境变量注入，这样同一份代码/镜像能部署到不同环境（dev/staging/prod）。

---

## 9. 环境变量与启动

### 9.1 服务器 .env（生产配置）

```dotenv
# API
API_PORT=3000

# Web —— 同源 /api，经 Nginx 反代（关键，不要写成 http://IP:3000）
WEB_PORT=3001
NEXT_PUBLIC_API_URL=/api

# Nginx 统一入口 + 后端 CORS 白名单
NGINX_PORT=80
PUBLIC_ORIGIN=http://8.159.144.140

# PostgreSQL —— 生产务必改强密码，不要用默认值
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<强密码>
POSTGRES_DB=fullstack

# Redis
REDIS_PASSWORD=<强密码>
REDIS_PORT=6379
```

**思考：`.env` 绝不进版本库**（`.gitignore` 排除），仓库里只保留 `.env.example` 做模板。密码这类机密通过服务器上的 `.env` 或密钥管理服务注入。

### 9.2 启动（用已加载的镜像，禁止服务器重新构建）

```bash
cd /opt/fullstack
docker compose up -d --no-build
```

**思考：`--no-build` 至关重要。** compose 里 api/web 带 `build:` 段，不加 `--no-build` 会触发服务器本地构建，又回到 OOM 老路。我们的镜像是本地构建好传上来的，这里只需用现成镜像启动。

### 9.3 依赖顺序与健康检查

compose 用 `depends_on` + `condition: service_healthy` 保证启动顺序：postgres/redis 健康 → api 启动 → api 健康 → web 启动 → nginx 启动。

**思考：分布式服务启动有先后依赖。** 数据库没就绪时 api 连接会失败崩溃。healthcheck + depends_on 让编排器自动等待依赖就绪，避免「启动竞态」。后端用 TypeORM 连 postgres，启动即建连，所以 postgres 必须先 healthy。

---

## 10. 安全加固（重点）

### 10.1 数据库/Redis 公网暴露问题

初版 compose 端口写成 `'5432:5432'`，Docker 会绑定到 `0.0.0.0`（所有网卡），**公网可直连数据库端口**。即使设了强密码，裸露端口也会持续遭受暴力破解和漏洞扫描。

**验证是否暴露：**

```bash
# 从外部测试端口可达性
nc -z -w 5 <公网IP> 5432 && echo "暴露了" || echo "安全"

# 在服务器上看监听地址
ss -tlnp | grep -E ':5432|:6379'
# 0.0.0.0:5432 → 暴露公网 ❌
# 127.0.0.1:5432 → 仅本地 ✓
```

### 10.2 修复：端口只绑定 127.0.0.1

```yaml
postgres:
  ports:
    - '127.0.0.1:${POSTGRES_PORT:-5432}:5432' # 仅本机可访问
redis:
  ports:
    - '127.0.0.1:${REDIS_PORT:-6379}:6379'
api:
  ports:
    - '127.0.0.1:${API_PORT:-3000}:3000' # 只供 Nginx 内部访问
web:
  ports:
    - '127.0.0.1:${WEB_PORT:-3001}:3001'
```

改完重建容器：`docker compose up -d --no-build postgres redis api web`

**思考：为什么不只靠安全组，而要在 Docker 层也锁死？**「纵深防御」原则——不依赖单一防线。安全组是云平台层规则，可能被误配、被同事改动；`127.0.0.1` 绑定是宿主机内核层的硬隔离，外部流量根本到不了。两层都做，任何一层失效另一层仍兜底。

> 实测细节：Docker 端口改 127.0.0.1 后，从公网 `nc` 测 5432 有时仍显示 "succeeded"，但发数据无任何响应——这是云网络层对 SYN 的假应答，并非真连到了服务。以 `ss -tlnp` 看到的实际监听地址为准（`127.0.0.1` 即安全）。

### 10.3 api/web 也不需要暴露公网

加了 Nginx 后，api（3000）、web（3001）都只需被 Nginx 在 Docker 内网访问，**不需要任何公网端口**。全部绑 `127.0.0.1`，唯一公网入口是 nginx 的 80。

### 10.4 安全组最终规则

入方向只保留：

| 协议 | 端口 | 来源           | 说明                                 |
| ---- | ---- | -------------- | ------------------------------------ |
| TCP  | 22   | 你的公网 IP/32 | SSH（建议限来源 IP，不要 0.0.0.0/0） |
| TCP  | 80   | 0.0.0.0/0      | HTTP 统一入口                        |

删除 3000、3001、5432、6379 的所有放行规则。

**思考：最小权限原则。** 只开必须开的端口，来源能限制就限制。SSH 限制到你的固定 IP 能挡掉绝大多数扫描攻击。

---

## 11. 容器内服务端访问后端的坑（SSR/RSC fetch failed）

### 11.1 现象

`/api-test` 页面（Server Component）报 "fetch failed"，但浏览器端 API 正常。

### 11.2 根因

这个 fetch 在 **web 容器内部**执行（不是浏览器）。代码回退到 `http://localhost:3000`，而在容器里 `localhost` 指向 **web 容器自己**，根本不是 api 容器。

**思考：要分清代码的执行位置。** Next.js 同一份代码可能在三处执行：浏览器、Node 服务端（SSR/RSC）、构建期。「localhost」在不同位置含义完全不同：

- 浏览器里 = 用户的机器
- web 容器里 = web 容器自己
- 容器间通信要用 Docker 服务名（`api`），由 Docker 内嵌 DNS 解析

### 11.3 修复

服务端 fetch 优先用 `API_PROXY_URL`（compose 已配 `http://api:3000`，走 Docker 内网服务名）：

```ts
// api-test/page.tsx（Server Component）
const API_BASE_URL =
  process.env.API_PROXY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// axios.ts 服务端分支同理
config.baseURL = process.env.API_PROXY_URL || process.env.API_BASE_URL || 'http://localhost:3000';
```

### 11.4 两条访问路径总结（务必理解）

| 调用场景                     | 运行位置 | 后端地址          | 是否经 Nginx          |
| ---------------------------- | -------- | ----------------- | --------------------- |
| 客户端组件 / SSE / WebSocket | 浏览器   | 同源 `/api`       | 是                    |
| SSR / RSC（如 api-test 页）  | web 容器 | `http://api:3000` | 否（Docker 内网直连） |

**思考：浏览器侧走公网入口（Nginx），服务端侧走内网捷径。** 二者地址不同是合理的——服务端没必要绕到公网再回来，直接走容器内网更快更安全。

---

## 12. 验证清单

部署后逐项验证（用变量包裹 URL，避免某些 shell 对 `health` 等词的处理异常）：

```bash
base="http://8.159.144.140"

# 前端首页
curl -s -o /dev/null -w "首页 => %{http_code}\n" "$base/"

# API（经 Nginx /api 反代）
curl -s -o /dev/null -w "API => %{http_code}\n" "$base/api/api-info"

# 真实业务接口
curl -s -o /dev/null -w "npm => %{http_code}\n" \
  "$base/api/npmdata/downloads?start=2024-01-01&end=2024-01-10&package=react"

# SSE 端点可达（长连接，能建立即正常）
curl -s -o /dev/null -w "SSE => %{http_code}\n" --max-time 3 "$base/api/serverstate/stream"

# 确认内部端口已对公网关闭（应 unreachable）
curl -s -o /dev/null -w "3000 => %{http_code}\n" --connect-timeout 8 "$base:3000/" || echo "3000 已关闭 ✓"
```

服务端状态检查：

```bash
cd /opt/fullstack
docker compose ps                                    # 所有容器 healthy/Up
docker compose ps --format '{{.Name}} -> {{.Ports}}' # 确认只有 nginx 是 0.0.0.0:80
ss -tlnp | grep -E ':5432|:6379|:3000|:3001'         # 应全是 127.0.0.1
```

---

## 13. 日常运维

```bash
# 查看状态 / 日志
docker compose ps
docker compose logs -f api          # 跟踪某服务日志
docker logs fullstack-nginx --tail 50

# 重启单个服务
docker compose restart nginx        # 改了 nginx 配置后

# 更新部署（本地构建 → 传镜像 → 重启容器）
# 1) 本地
docker buildx build --platform linux/amd64 --build-arg NEXT_PUBLIC_API_URL=/api \
  -f apps/web/Dockerfile -t fullstack/web:latest --load .
docker save fullstack/web:latest | gzip | \
  ssh -i ~/.ssh/aliyun_key.pem root@<IP> "gunzip | docker load"
# 2) 服务器
docker compose up -d --no-build web

# 数据备份（重要）
docker exec fullstack-postgres pg_dump -U postgres fullstack > backup_$(date +%F).sql

# 清理无用镜像，释放磁盘
docker image prune -f
```

**思考：更新流程固定为「本地构建 → 传镜像 → `--no-build` 重启」**，全程不在服务器构建，彻底规避 OOM。镜像即制品，服务器只负责运行。

---

## 14. 问题速查表

| 现象                                      | 根因                                  | 解决                                                     |
| ----------------------------------------- | ------------------------------------- | -------------------------------------------------------- |
| SSH `port 22 timed out`                   | 用了内网 IP / 安全组没放行本机公网 IP | 用公网 IP；`curl ifconfig.me` 查本机公网 IP 加到安全组   |
| SSH `kex_exchange_identification: closed` | 缺密钥 / IP 错误                      | `-i 密钥.pem` + 正确公网 IP                              |
| `REMOTE HOST IDENTIFICATION CHANGED`      | IP 复用过旧实例                       | `ssh-keygen -R <IP>`                                     |
| dnf 装 docker 报 alinux4 源 404           | `--releasever=9` 影响了系统源         | 只 sed 替换 docker-ce.repo 里的 `$releasever`            |
| 拉 Docker Hub 镜像 EOF/极慢               | 国内网络                              | 配 registry-mirrors（服务器 + 本地 Docker 都要配）       |
| 某镜像加速器拉不动                        | 加速器对该镜像不稳                    | 换 daocloud 全限定名拉取后 `docker tag` 回标准名         |
| 构建卡死、SSH 无响应                      | 小内存 Next.js 构建 OOM               | 本地构建镜像传上去；或加大 swap / 升配                   |
| `ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE`   | pnpm 10 deploy 默认行为变更           | deploy 命令加 `--legacy`                                 |
| `Failed to fetch Geist from Google Fonts` | 构建期访问 Google 失败                | 改用 `geist` npm 包（内置字体）                          |
| 跨架构镜像无法运行                        | Mac arm64 vs 服务器 amd64             | buildx `--platform linux/amd64`                          |
| 数据库端口公网可连                        | Docker 绑定 `0.0.0.0`                 | 端口改 `127.0.0.1:5432:5432`                             |
| 容器重建后 Nginx 502                      | Nginx 启动时缓存了上游 IP             | `resolver 127.0.0.11` + 变量式 `proxy_pass`              |
| SSE 前端收不到实时数据                    | Nginx 缓冲了响应                      | `proxy_buffering off` + 调大超时                         |
| WebSocket 连不上                          | 缺 Upgrade 头 / path 不对             | `map` 设 Connection 头；socket.io `path: /api/socket.io` |
| 改 NEXT_PUBLIC_API_URL 不生效             | 该变量构建期烤入 bundle               | 必须重新构建 web 镜像                                    |
| SSR 页面 fetch failed                     | 容器内 `localhost` 指向自己           | 服务端 fetch 用 `http://api:3000`（服务名）              |

---

## 15. HTTPS 展望（需要域名）

当前是 HTTP。**受信任的免费证书（Let's Encrypt）必须有域名**，纯 IP 申请不到（只能自签，浏览器报不安全）。

升级路径：

1. 注册域名，解析（A 记录）到服务器公网 IP。
2. Nginx 加 443 server block + 证书；用 Certbot 自动签发：
   ```bash
   certbot --nginx -d your-domain.com
   ```
3. `PUBLIC_ORIGIN` / CORS 白名单改为 `https://your-domain.com`。
4. 80 端口配置 301 跳转到 443。

---

## 16. 核心经验提炼

1. **分清 IP 类型**：内网 IP 对内、公网 IP 对外；安全组填的是「本机公网出口 IP」。
2. **小内存服务器不要本地构建重型前端**：本地构建镜像 → 传输 → 运行，服务器只跑不建。
3. **镜像即制品**：构建与运行分离，环境差异通过环境变量注入，同镜像多环境复用。
4. **反向代理收口**：单一公网入口，统一前缀隔离前后端路由，便于加 TLS/限流/日志。
5. **纵深防御**：安全组 + Docker `127.0.0.1` 绑定双层隔离，不把数据库裸露公网。
6. **分清代码执行位置**：浏览器 / 服务端 / 构建期，`localhost` 在每处含义不同。
7. **长连接要特殊照顾**：SSE 关缓冲、WS 传 Upgrade 头、超时调长。
8. **部署前本地跑生产构建**：`pnpm build` 能提前暴露类型错误、字体等构建期问题。

---

> 本文基于一次真实部署整理（阿里云 ECS · Alibaba Cloud Linux 4 · 1.6GB 内存）。命令与配置均经实测，可直接参考复用。
