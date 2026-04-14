import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

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

    // 可以在这里添加其他请求处理
    console.log("请求发送:", config);
    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  },
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 处理响应数据
    console.log("响应收到:", response);
    return response.data;
  },
  (error) => {
    // 处理响应错误
    if (error.response) {
      // 服务器响应了错误状态码
      const status = error.response.status;

      switch (status) {
        case 401:
          // 未授权 - 清除 token 并重定向到登录
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
          }
          break;
        case 403:
          // 禁止访问
          console.error("禁止访问");
          break;
        case 404:
          // 未找到
          console.error("资源未找到");
          break;
        case 500:
          // 服务器错误
          console.error("服务器错误");
          break;
        default:
          console.error("请求失败:", error.response.data);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error("没有收到响应:", error.request);
    } else {
      // 其他错误
      console.error("错误:", error.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
