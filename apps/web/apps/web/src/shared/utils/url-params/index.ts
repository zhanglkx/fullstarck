/**
 * URL Parameter Utilities
 *
 * 统一导出服务器端和客户端的 URL 参数工具
 */

// Server-side utilities (无 "use client")
export { getServerUrlParams } from "./server";

// Client-side utilities (带 "use client")
export { useUrlParams } from "./client";
