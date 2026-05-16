/**
 * useNavigationSync Hook
 * Manages navigation data synchronization between API, localStorage cache, and fallback
 */

import { useState, useEffect, useCallback } from 'react';
import type { Shortcut } from '../types';
import { DEFAULT_SHORTCUTS } from '../lib/default-shortcuts';
import {
  fetchNavGroups,
  type NavGroupResponse,
  type NavItemResponse,
} from '../services/navigation-api';

const CACHE_KEY = 'aerotab_nav_cache';

// ==================== Types ====================

export interface UseNavigationSyncReturn {
  shortcuts: Shortcut[];
  setShortcuts: React.Dispatch<React.SetStateAction<Shortcut[]>>;
  isLoading: boolean;
  isFromCache: boolean;
  syncAction: (action: () => Promise<void>) => Promise<void>;
}

// ==================== Helper Functions ====================

/**
 * Convert NavItem to Shortcut
 */
function apiItemToShortcut(item: NavItemResponse): Shortcut | null {
  // Skip component type items
  if (item.type === 'component') return null;

  return {
    id: item.id,
    title: item.name,
    url: item.url || '',
    icon: item.src || undefined,
    iconBgColor: item.backgroundColor || undefined,
    type: 'link',
  };
}

/**
 * Convert NavGroup to Shortcut (folder)
 */
function apiGroupToShortcut(group: NavGroupResponse): Shortcut {
  const children = group.items
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(apiItemToShortcut)
    .filter((item): item is Shortcut => item !== null);

  return {
    id: group.id,
    title: group.name,
    url: '#',
    type: 'folder',
    icon: group.icon || undefined,
    children,
  };
}

/**
 * Convert API NavGroup[] to frontend Shortcut[]
 */
function apiGroupsToShortcuts(groups: NavGroupResponse[]): Shortcut[] {
  return groups.sort((a, b) => a.sortOrder - b.sortOrder).map(apiGroupToShortcut);
}

/**
 * Read cached shortcuts from localStorage
 */
function readCachedShortcuts(): Shortcut[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as Shortcut[];
  } catch {
    return null;
  }
}

/**
 * Write shortcuts to localStorage cache
 */
function writeCacheToStorage(shortcuts: Shortcut[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(shortcuts));
  } catch {
    // Quota exceeded or private mode
    console.warn('[useNavigationSync] Failed to write cache to localStorage');
  }
}

// ==================== Hook ====================

/**
 * Hook for synchronizing navigation data between API, cache, and fallback
 *
 * Behavior:
 * 1. On mount, immediately return cached data from localStorage (if exists)
 * 2. Asynchronously fetch latest data from API
 * 3. If API succeeds, update cache and state
 * 4. If API fails, fallback to DEFAULT_SHORTCUTS
 * 5. Provide syncAction for optimistic updates with background sync
 */
export function useNavigationSync(): UseNavigationSyncReturn {
  // Initialize with cached data or fallback
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    const cached = readCachedShortcuts();
    return cached ?? DEFAULT_SHORTCUTS;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(() => {
    return readCachedShortcuts() !== null;
  });

  // Fetch data from API
  useEffect(() => {
    let cancelled = false;

    async function fetchFromApi() {
      try {
        const groups = await fetchNavGroups();

        if (cancelled) return;

        const newShortcuts = apiGroupsToShortcuts(groups);

        // Update cache
        writeCacheToStorage(newShortcuts);

        // Update state
        setShortcuts(newShortcuts);
        setIsFromCache(false);
        setIsLoading(false);

        console.log('[useNavigationSync] Successfully loaded from API');
      } catch (error) {
        if (cancelled) return;

        // API failed - use fallback
        console.warn(
          '[useNavigationSync] API fetch failed, using fallback:',
          error instanceof Error ? error.message : String(error),
        );

        // If we don't have cached data, use DEFAULT_SHORTCUTS
        if (isFromCache && readCachedShortcuts() === null) {
          setShortcuts(DEFAULT_SHORTCUTS);
        }

        setIsLoading(false);
      }
    }

    fetchFromApi();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Execute an action with optimistic update support
   * - Runs the action in the background
   * - Logs errors but doesn't block UI
   */
  const syncAction = useCallback(async (action: () => Promise<void>): Promise<void> => {
    try {
      await action();
    } catch (error) {
      console.error(
        '[useNavigationSync] Sync action failed:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }, []);

  return {
    shortcuts,
    setShortcuts,
    isLoading,
    isFromCache,
    syncAction,
  };
}
