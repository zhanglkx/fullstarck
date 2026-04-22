import type { NextConfig } from "next";

// 后端 API 地址：容器内通过服务名访问，本地开发默认 localhost:3000
const API_PROXY_URL = process.env.API_PROXY_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  // 产出精简的 standalone 构建，便于在 Docker 中运行
  output: "standalone",

  // 允许通过 IP 地址访问开发服务器（修复 HMR WebSocket 跨域问题）
  allowedDevOrigins: ["10.32.75.123"],

  // API 代理配置（客户端 /api 请求代理到后端）
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
