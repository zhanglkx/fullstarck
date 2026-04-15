import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

/**
 * API Base URL 配置
 *
 * 客户端（浏览器）：使用 /api 前缀（通过 Next.js rewrites 代理）
 * 服务端（SSR）：直接访问后端地址
 */

// 创建 axios 实例
export const apiClient: AxiosInstance = axios.create({
  // 不设置 baseURL，在拦截器中动态设置
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 动态设置 baseURL（每次请求时判断环境）
    if (typeof window !== "undefined") {
      // 客户端：使用 /api 前缀
      config.baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";
    } else {
      // 服务端：直接访问后端
      config.baseURL = process.env.API_BASE_URL || "http://localhost:3000";
    }

    // 从 localStorage 获取 token（如果有）
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (process.env.NODE_ENV === "development") console.debug("[api] request", config.url);
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") console.error("[api] request error", error);
    return Promise.reject(error);
  },
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const isDev = process.env.NODE_ENV === "development";
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
          }
          break;
        case 403:
          if (isDev) console.warn("[api] forbidden");
          break;
        case 404:
          if (isDev) console.warn("[api] not found");
          break;
        case 500:
          if (isDev) console.error("[api] server error");
          break;
        default:
          if (isDev) console.error("[api] request failed", error.response.data);
      }
    } else if (error.request && isDev) {
      console.error("[api] no response", error.request);
    } else if (isDev) {
      console.error("[api]", error.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
