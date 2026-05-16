import { useCallback, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import ShortcutGrid from './components/ShortcutGrid';
import { ZenClockPanel } from './components/ZenClockPanel';
import type { AppSettings, Shortcut } from './types';
import { DEFAULT_SETTINGS, normalizeSettings } from './lib/settings';
import { STORAGE_KEY_BOOKMARK_NAV, STORAGE_KEY_SETTINGS } from './lib/storage-keys';
import {
  bookmarkNavStorageCodec,
  settingsStorageCodec,
  type BookmarkNavState,
} from './lib/storage-codecs';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useWallpaperDisplay } from './hooks/useWallpaperDisplay';
import { useClock } from './hooks/useClock';
import { useNavigationSync } from './hooks/useNavigationSync';
import SettingsModal from './components/SettingsModal';
import {
  addShortcutUnderParent as addShortcutUnderParentInTree,
  editShortcutInTree,
  ITAB_LOOSE_PARENT_KEY,
  mergeSiblingsUnderParent,
  moveShortcutFromFolderToRoot,
  removeShortcutDeep,
  reorderRootFolders,
  reorderSiblingsUnderParent,
} from './lib/shortcuts-tree';
import * as navApi from './services/navigation-api';

const ZEN_GREETING = 'Think Different';

function defaultBookmarkNav(): BookmarkNavState {
  return { activePageId: ITAB_LOOSE_PARENT_KEY, drillFolderIds: [] };
}

function App() {
  const [settings, setSettings] = useLocalStorageState(
    STORAGE_KEY_SETTINGS,
    () => DEFAULT_SETTINGS,
    settingsStorageCodec,
  );
  const { shortcuts, setShortcuts, isLoading: _isLoading, syncAction } = useNavigationSync();
  const [bookmarkNav, setBookmarkNav] = useLocalStorageState(
    STORAGE_KEY_BOOKMARK_NAV,
    defaultBookmarkNav,
    bookmarkNavStorageCodec,
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZenFocus, setIsZenFocus] = useState(true);
  const time = useClock();
  const displayBgUrl = useWallpaperDisplay(settings);

  const updateSettings = (newPartial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  const addShortcutUnderParent = useCallback(
    (parentKey: string, shortcut: Shortcut) => {
      // Optimistic update
      setShortcuts((prev) => addShortcutUnderParentInTree(prev, parentKey, shortcut));

      // Sync to API
      syncAction(async () => {
        // For folder items, find the group ID and create item
        if (parentKey !== ITAB_LOOSE_PARENT_KEY) {
          await navApi.createItem(parentKey, {
            name: shortcut.title,
            url: shortcut.url || undefined,
            src: shortcut.icon,
            type: 'icon',
            backgroundColor: shortcut.iconBgColor,
          });
        }
      });
    },
    [setShortcuts, syncAction],
  );

  const removeShortcut = useCallback(
    (id: string) => {
      // Optimistic update
      setShortcuts((prev) => removeShortcutDeep(prev, id));

      // Sync to API
      syncAction(async () => {
        await navApi.deleteItem(id);
      });
    },
    [setShortcuts, syncAction],
  );

  const editShortcut = useCallback(
    (
      id: string,
      title: string,
      url: string,
      iconPatch?: string | null,
      iconBgColorPatch?: string | null,
    ) => {
      // Optimistic update
      setShortcuts((prev) => editShortcutInTree(prev, id, title, url, iconPatch, iconBgColorPatch));

      // Sync to API
      syncAction(async () => {
        await navApi.updateItem(id, {
          name: title,
          url: url || undefined,
          src: iconPatch ?? undefined,
          backgroundColor: iconBgColorPatch ?? undefined,
        });
      });
    },
    [setShortcuts, syncAction],
  );

  const handleReorderSiblings = useCallback(
    (parentKey: string, dragId: string, targetId: string) => {
      // Optimistic update
      setShortcuts((prev) => reorderSiblingsUnderParent(prev, parentKey, dragId, targetId));

      // Sync to API - get all sibling IDs in new order
      syncAction(async () => {
        // The actual reorder requires the full ordered list
        // This would need to be computed from the updated state
        // For now, we skip API sync on reorder (can be enhanced later)
      });
    },
    [setShortcuts, syncAction],
  );

  const handleMergeSiblings = useCallback(
    (parentKey: string, dragId: string, dropId: string) => {
      // Optimistic update
      setShortcuts((prev) => mergeSiblingsUnderParent(prev, parentKey, dragId, dropId));

      // Sync to API
      syncAction(async () => {
        await navApi.mergeItems({
          itemIds: [dragId, dropId],
          folderName: 'New Folder',
        });
      });
    },
    [setShortcuts, syncAction],
  );

  const handleReorderRootFolders = useCallback(
    (dragId: string, targetId: string) => {
      // Optimistic update
      setShortcuts((prev) => reorderRootFolders(prev, dragId, targetId));

      // Sync to API
      syncAction(async () => {
        // The actual reorder requires the full ordered list
        // This would need to be computed from the updated state
        // For now, we skip API sync on reorder (can be enhanced later)
      });
    },
    [setShortcuts, syncAction],
  );

  const handleMoveToRoot = useCallback(
    (folderId: string, itemId: string) => {
      // Optimistic update
      setShortcuts((prev) => moveShortcutFromFolderToRoot(prev, folderId, itemId));

      // Sync to API - move item to "loose" group
      syncAction(async () => {
        // Would need a "loose" group concept in the backend
        // For now, we skip API sync on move to root
      });
    },
    [setShortcuts, syncAction],
  );

  const addRootFolder = useCallback(
    (folder: Shortcut) => {
      // Optimistic update
      setShortcuts((prev) => [...prev, folder]);

      // Sync to API
      syncAction(async () => {
        await navApi.createGroup({
          name: folder.title,
          icon: folder.icon,
        });
      });
    },
    [setShortcuts, syncAction],
  );

  const handleBookmarkNavChange = useCallback(
    (next: BookmarkNavState) => {
      setBookmarkNav(next);
    },
    [setBookmarkNav],
  );

  const handleImport = useCallback(
    (data: { settings: AppSettings; shortcuts: Shortcut[] }) => {
      if (data.settings) setSettings(normalizeSettings(data.settings));
      if (data.shortcuts) {
        setShortcuts(data.shortcuts);

        // Sync to API
        syncAction(async () => {
          await navApi.importNavigation({
            groups: data.shortcuts
              .filter((s) => s.type === 'folder')
              .map((folder) => ({
                name: folder.title,
                icon: folder.icon,
                items:
                  folder.children?.map((item) => ({
                    name: item.title,
                    url: item.url,
                    src: item.icon,
                    type: 'icon' as const,
                    backgroundColor: item.iconBgColor,
                  })) || [],
              })),
          });
        });
      }
      setBookmarkNav(defaultBookmarkNav());
    },
    [setSettings, setShortcuts, setBookmarkNav, syncAction],
  );

  const blurPx = settings.blurLevel;
  const bgFilter = `blur(${blurPx}px) brightness(0.85)`;

  return (
    <div className="relative min-h-dvh h-screen w-full overflow-hidden">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-[filter] duration-500 ease-out"
        style={{
          backgroundImage: `url(${displayBgUrl})`,
          filter: bgFilter,
          transform: 'scale(1.06)',
        }}
      />

      <div className="fixed inset-0 z-0 bg-black/25 pointer-events-none" />

      <div className="relative z-10 flex h-dvh min-h-0 max-h-dvh w-full flex-col items-center overflow-hidden px-4">
        <ZenClockPanel
          time={time}
          isZenFocus={isZenFocus}
          greeting={ZEN_GREETING}
          onToggleZen={() => setIsZenFocus((v) => !v)}
        />

        <div
          className={`w-full min-w-0 max-w-[90vw] mx-auto flex justify-center tabliss-zen-ease will-change-[opacity,transform] transition-[opacity,transform] duration-500 ${
            isZenFocus
              ? 'pointer-events-none absolute inset-x-4 bottom-10 opacity-0 scale-[0.985] translate-y-3'
              : 'relative mt-[20px] mb-[20px] min-h-0 flex-1 overflow-hidden opacity-100 scale-100 translate-y-0'
          }`}
          aria-hidden={isZenFocus}
        >
          <ShortcutGrid
            shortcuts={shortcuts}
            gridConfig={settings.gridConfig}
            openInNewTab={settings.openInNewTab}
            bookmarkNav={bookmarkNav}
            onBookmarkNavChange={handleBookmarkNavChange}
            onAddShortcutUnderParent={addShortcutUnderParent}
            onAddRootFolder={addRootFolder}
            onRemoveShortcut={removeShortcut}
            onEditShortcut={editShortcut}
            onReorderSiblings={handleReorderSiblings}
            onMergeSiblings={handleMergeSiblings}
            onReorderRootFolders={handleReorderRootFolders}
            onMoveToRoot={handleMoveToRoot}
          />
        </div>
      </div>

      <div className="fixed top-6 right-6 z-50 flex gap-3 p-2 -m-2 opacity-0 transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-white/60 hover:text-white transition-all duration-300 group shadow-lg border border-white/5"
          title="设置"
        >
          <SettingsIcon
            size={20}
            className="group-hover:rotate-45 transition-transform duration-500"
          />
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        shortcuts={shortcuts}
        onUpdateSettings={updateSettings}
        onImport={handleImport}
      />
    </div>
  );
}

export default App;
