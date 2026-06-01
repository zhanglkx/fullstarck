/**
 * Navigation API Service Layer
 * Provides methods to interact with the backend Navigation API
 */

import { API_BASE_URL } from '@fullstack/shared';

const BASE = `${API_BASE_URL}/navigation`;
const TIMEOUT = 5000;

// ==================== Types ====================

export interface NavItemResponse {
  id: string;
  name: string;
  url: string | null;
  src: string | null;
  type: 'icon' | 'text' | 'component';
  backgroundColor: string | null;
  iconText: string | null;
  size: string | null;
  component: string | null;
  sortOrder: number;
  originalId: string | null;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NavGroupResponse {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  items: NavItemResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

// Request types
export interface CreateGroupPayload {
  name: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateGroupPayload {
  name?: string;
  icon?: string;
  sortOrder?: number;
}

export interface CreateItemPayload {
  name: string;
  url?: string;
  src?: string;
  type: 'icon' | 'text' | 'component';
  backgroundColor?: string;
  iconText?: string;
  size?: string;
  component?: string;
  sortOrder?: number;
}

export interface UpdateItemPayload {
  name?: string;
  url?: string;
  src?: string;
  type?: 'icon' | 'text' | 'component';
  backgroundColor?: string;
  iconText?: string;
  size?: string;
  component?: string;
  sortOrder?: number;
}

export interface MoveItemPayload {
  targetGroupId: string;
  sortOrder?: number;
}

export interface MergeItemsPayload {
  itemIds: string[];
  folderName: string;
}

export interface ImportNavigationPayload {
  groups: {
    name: string;
    icon?: string;
    items: {
      name: string;
      url?: string;
      src?: string;
      type?: 'icon' | 'text' | 'component';
      backgroundColor?: string;
      iconText?: string;
      size?: string;
      component?: string;
      originalId?: string;
    }[];
  }[];
}

// ==================== Utility Functions ====================

/**
 * Fetch with timeout using AbortController
 * @param url - Request URL
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @returns Response data
 */
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeout: number = TIMEOUT,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = (await response.json()) as ApiResponse<T>;

    // Handle wrapped response format
    if (json.code !== undefined && json.data !== undefined) {
      return json.data;
    }

    // Fallback for non-wrapped responses
    return json as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ==================== Group API Methods ====================

/**
 * Fetch all navigation groups with their items
 */
export async function fetchNavGroups(): Promise<NavGroupResponse[]> {
  return fetchWithTimeout<NavGroupResponse[]>(`${BASE}/groups`);
}

/**
 * Create a new navigation group
 */
export async function createGroup(data: CreateGroupPayload): Promise<NavGroupResponse> {
  return fetchWithTimeout<NavGroupResponse>(`${BASE}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing navigation group
 */
export async function updateGroup(id: string, data: UpdateGroupPayload): Promise<NavGroupResponse> {
  return fetchWithTimeout<NavGroupResponse>(`${BASE}/groups/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Delete a navigation group (cascades to items)
 */
export async function deleteGroup(id: string): Promise<void> {
  await fetchWithTimeout<void>(`${BASE}/groups/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Reorder navigation groups
 */
export async function reorderGroups(ids: string[]): Promise<void> {
  await fetchWithTimeout<void>(`${BASE}/groups/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

// ==================== Item API Methods ====================

/**
 * Create a new navigation item in a group
 */
export async function createItem(
  groupId: string,
  data: CreateItemPayload,
): Promise<NavItemResponse> {
  return fetchWithTimeout<NavItemResponse>(`${BASE}/groups/${groupId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing navigation item
 */
export async function updateItem(id: string, data: UpdateItemPayload): Promise<NavItemResponse> {
  return fetchWithTimeout<NavItemResponse>(`${BASE}/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Delete a navigation item
 */
export async function deleteItem(id: string): Promise<void> {
  await fetchWithTimeout<void>(`${BASE}/items/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Reorder navigation items within the same group
 */
export async function reorderItems(ids: string[]): Promise<void> {
  await fetchWithTimeout<void>(`${BASE}/items/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

/**
 * Move a navigation item to another group
 */
export async function moveItem(id: string, data: MoveItemPayload): Promise<NavItemResponse> {
  return fetchWithTimeout<NavItemResponse>(`${BASE}/items/${id}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ==================== Batch Operations ====================

/**
 * Merge two items into a new folder (creates new group)
 */
export async function mergeItems(data: MergeItemsPayload): Promise<NavGroupResponse> {
  return fetchWithTimeout<NavGroupResponse>(`${BASE}/items/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Import complete navigation configuration (overwrites existing)
 */
export async function importNavigation(data: ImportNavigationPayload): Promise<void> {
  await fetchWithTimeout<void>(`${BASE}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Export complete navigation configuration
 */
export async function exportNavigation(): Promise<ImportNavigationPayload> {
  return fetchWithTimeout<ImportNavigationPayload>(`${BASE}/export`);
}
