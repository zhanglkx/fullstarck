/**
 * 用户相关 API
 * 这是一个 API 模块示例
 */

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

/**
 * 获取所有用户
 */
export async function getUsers(page = 1, limit = 10) {
  return apiGet<{ users: User[]; total: number }>("/users", {
    params: { page, limit },
  });
}

/**
 * 获取单个用户
 */
export async function getUser(id: string) {
  return apiGet<User>(`/users/${id}`);
}

/**
 * 创建用户
 */
export async function createUser(data: CreateUserRequest) {
  return apiPost<User>("/users", data);
}

/**
 * 更新用户
 */
export async function updateUser(id: string, data: UpdateUserRequest) {
  return apiPut<User>(`/users/${id}`, data);
}

/**
 * 删除用户
 */
export async function deleteUser(id: string) {
  return apiDelete(`/users/${id}`);
}

/**
 * 获取用户的下载统计
 */
export async function getUserStats(id: string) {
  return apiGet<{
    totalDownloads: number;
    packages: Array<{ name: string; downloads: number }>;
  }>(`/users/${id}/stats`);
}
