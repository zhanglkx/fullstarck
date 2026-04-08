import { apiClient } from "./axios";
import { AxiosRequestConfig } from "axios";

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
  code?: number;
}

/**
 * 发送 GET 请求
 */
export async function apiGet<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.get<unknown, T>(url, config);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * 发送 POST 请求
 */
export async function apiPost<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await apiClient.post<unknown, T>(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * 发送 PUT 请求
 */
export async function apiPut<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await apiClient.put<unknown, T>(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * 发送 DELETE 请求
 */
export async function apiDelete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.delete<unknown, T>(url, config);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * 发送 PATCH 请求
 */
export async function apiPatch<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await apiClient.patch<unknown, T>(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
}
