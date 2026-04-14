import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许通过 IP 地址访问开发服务器（修复 HMR WebSocket 跨域问题）
  allowedDevOrigins: ['10.32.75.123'],

  // API 代理配置（客户端 /api 请求代理到后端）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
};

export default nextConfig;
