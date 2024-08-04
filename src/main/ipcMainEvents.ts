/* eslint-disable promise/always-return */
/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */
import AutoLaunch from 'easy-auto-launch';
import {
  app,
  BrowserView,
  ipcMain,
  IpcMainEvent,
  nativeTheme,
  shell,
  WebContents,
} from 'electron';
import { TFunction } from 'react-i18next';

import { Bookmark, Provider as BookmarkProvider, Tag } from 'types/bookmarks';
import { Download } from 'types/downloads';
import { Extension } from 'types/extensions';
import { History } from 'types/history';
import { Locale } from 'types/i18n';
import {
  IpcAddBookmark,
  IpcAddDownload,
  IpcAddHistory,
  IpcAnalyticsEvent,
  IpcAnalyticsPage,
  IpcCertificateErrorAnswer,
  IpcInspectElement,
  IpcRenameTab,
  IpcSaveTab,
  IpcSetStoreValue,
  IpcSetWindowsCount,
  IpcShowBoardContextMenu,
  IpcShowLeftbarContextMenu,
  IpcShowTabContextMenu,
  IpcTabPurge,
  IpcTabSelect,
} from 'types/ipc';
import { DomainSuggestion } from 'types/suggestions';
import { ChatRunner } from 'types/chat';

import { event, page } from './analytics';
import { getUrlToOpen, setUrlToOpen } from './appEvents';
import {
  editBookmark,
  getAllBookmarks,
  getBookmarksFromProvider,
  getBookmarksProviders,
  getBookmarksTags,
  importBookmarks,
  isBookmarked,
  removeBookmark,
  addBookmark,
  findBookmarksByDomain,
  findInBookmarks,
} from './bookmarks';
import { getMainWindow, getSelectedView, setBrowserViewBonds } from './browser';
import {
  showBoardContextMenu,
  showLeftbarContextMenu,
  showTabContextMenu,
} from './contextMenu';
import {
  addDownload,
  clearDownloads,
  getAllDownloads,
  removeDownload,
} from './downloads';
import {
  deleteExtension,
  getAllExtensions,
  getExtensionsObject,
  installExtension,
} from './extensions';
import {
  addHistory,
  clearHistory,
  findHistoryByDomain,
  findInHistory,
  getAllHistory,
  removeHistory,
} from './history';
import i18n from './i18n';
import { getStore } from './store';
import { purgeTab, renameTab, saveTab, selectTab } from './tabs';
import { getState, setState, setStateAt } from './BonBon_Global_State';
import { endChat, initChat, setUsername, setMagic, createRunner } from './chat';

const store = getStore();
let views: Record<string, BrowserView> = {};
const browsers: Record<string, WebContents> = {};
const certificateErrorAuth: { webContentsId: number; fingerprint: string }[] =
  [];

export const getBrowsers = () => browsers;
export const getViews = () => views;
export const setViews = (newViews: Record<string, BrowserView>) => {
  views = newViews;
};

export const getCertificateErrorAuth = (
  webContentsId: number,
  fingerprint: string
) => {
  const auth = certificateErrorAuth.find(
    (c) => c.webContentsId === webContentsId && c.fingerprint === fingerprint
  );
  return !!auth;
};

const bonbonAutoLauncher = new AutoLaunch({
  name: 'BonBon',
});

const sendChatStateUpdate = () => {
  const chatState = getState("chat") ?? {}
  console.log('sendChatSTtateUpdate', { chatState })
  Object.keys(getViews()).forEach((browserId) => {
    getViews()[browserId].webContents.send('chat-state', { chatState });
  })
}

export const makeIpcMainEvents = (): void => {
  const extensions = getExtensionsObject();
  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light';
    } else {
      nativeTheme.themeSource = 'dark';
    }
    return nativeTheme.shouldUseDarkColors;
  });

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system';
  });

  ipcMain.on('inspectElement', (e: IpcMainEvent, args: IpcInspectElement) => {
    e.sender.inspectElement(args.x, args.y);
  });

  ipcMain.on('analytics-event', (_event, args: IpcAnalyticsEvent) => {
    event(args.eventName, args.params);
  });

  ipcMain.on('analytics-page', (_event, args: IpcAnalyticsPage) => {
    page(args.pageName, args.params);
  });

  ipcMain.on('tab-select', (_event, args: IpcTabSelect) => {
    selectTab(args);
  });

  ipcMain.on('close-active-board', () => {
    getMainWindow()?.webContents.send('close-active-tab');
  });

  ipcMain.on('show-library', () => {
    getSelectedView()?.webContents.send('show-library');
  });

  ipcMain.on('show-settings', () => {
    getSelectedView()?.webContents.send('show-settings');
  });

  ipcMain.on('tab-purge', (_event, args: IpcTabPurge) => {
    purgeTab(args);
  });

  ipcMain.on('save-tab', (_event, args: IpcSaveTab) => {
    saveTab(args);
  });

  ipcMain.on('rename-tab', (_event, args: IpcRenameTab) => {
    renameTab(args);
  });

  ipcMain.on('select-browser', (_event, webContentsId: string) => {
    if (browsers[webContentsId]) extensions.selectTab(browsers[webContentsId]);
  });

  ipcMain.on('select-browserView', () => {
    const selectedView = getSelectedView();
    if (selectedView) extensions.selectTab(selectedView.webContents);
  });

  ipcMain.on('select-next-board', () => {
    getMainWindow()?.webContents.send('select-next-board');
  });

  ipcMain.on('set-windows-count', (_event, args: IpcSetWindowsCount) => {
    getMainWindow()?.webContents.send('set-windows-count', args);
  });

  ipcMain.on('close-app', () => {
    event('close_app');
    app.quit();
  });

  ipcMain.on('minimize-app', () => {
    getMainWindow()?.minimize();
  });

  ipcMain.on('maximize-app', () => {
    const mainWindow = getMainWindow();
    mainWindow?.isMaximized()
      ? mainWindow.unmaximize()
      : mainWindow?.maximize();

    const view = getSelectedView();
    if (view) setBrowserViewBonds(view, false);
  });

  ipcMain.on('show-app-menu', () => {
    getSelectedView()?.webContents.send('show-app-menu');
  });

  ipcMain.on('show-downloads-preview', () => {
    getSelectedView()?.webContents.send('show-downloads-preview');
  });

  ipcMain.handle('get-store-value', (_event, key: string) => {
    return store.get(key);
  });

  ipcMain.handle(
    'set-store-value',
    (_e, args: IpcSetStoreValue): Promise<void> => {
      return new Promise((resolve, reject) => {
        let rejected = false;

        store.set(args.key, args.value);

        switch (args.key) {
          case 'application.launchAtStartup':
            args.value === true
              ? bonbonAutoLauncher.enable().catch(() => {
                reject(
                  new Error(`Couldn't enable BonBon Browser at startup.`)
                );
                rejected = true;
              })
              : bonbonAutoLauncher.disable().catch(() => {
                reject(
                  new Error(`Couldn't disable BonBon Browser at startup.`)
                );
                rejected = true;
              });
            break;

          default:
            break;
        }

        if (!rejected) resolve();
      });
    }
  );

  ipcMain.handle(
    'change-language',
    (_e, locale: Locale): Promise<TFunction> => {
      return i18n.changeLanguage(locale);
    }
  );

  ipcMain.handle('add-history', (_e, args: IpcAddHistory): Promise<History> => {
    return addHistory(args);
  });

  ipcMain.handle('remove-history', (_e, id: number): Promise<void> => {
    return removeHistory(id);
  });

  ipcMain.handle('clear-history', (): Promise<void> => {
    return clearHistory();
  });

  ipcMain.handle('find-in-history', (_e, str: string): Promise<History[]> => {
    return findInHistory(str);
  });

  ipcMain.handle('get-all-history', (_e): Promise<History[]> => {
    return getAllHistory();
  });

  ipcMain.handle('is-bookmarked', (_e, str: string): Promise<boolean> => {
    return isBookmarked(str);
  });

  ipcMain.handle(
    'add-bookmark',
    (_e, args: IpcAddBookmark): Promise<Bookmark> => {
      return addBookmark(args);
    }
  );

  ipcMain.handle('remove-bookmark', (_e, url: string): Promise<void> => {
    return removeBookmark(url);
  });

  ipcMain.handle('get-all-bookmarks', () => {
    return getAllBookmarks();
  });

  ipcMain.on(
    'certificate-error-answer',
    (_e, args: IpcCertificateErrorAnswer) => {
      if (args.isTrusted) {
        certificateErrorAuth.push({
          webContentsId: args.webContentsId,
          fingerprint: args.fingerprint,
        });
      }
    }
  );

  ipcMain.on('show-item-in-folder', (_e, filepath: string) => {
    shell.showItemInFolder(filepath);
  });

  ipcMain.handle('add-download', (_e, args: IpcAddDownload): Promise<void> => {
    return addDownload(args);
  });

  ipcMain.handle('get-all-downloads', (): Promise<Download[]> => {
    return getAllDownloads();
  });

  ipcMain.handle('clear-downloads', (): Promise<void> => {
    return clearDownloads();
  });

  ipcMain.handle('remove-download', (_e, id: number): Promise<void> => {
    return removeDownload(id);
  });

  ipcMain.on(
    'show-tab-context-menu',
    (e, params: IpcShowTabContextMenu): void => {
      showTabContextMenu(e, params);
    }
  );

  ipcMain.on(
    'show-leftbar-context-menu',
    (e, params: IpcShowLeftbarContextMenu): void => {
      showLeftbarContextMenu(e, params);
    }
  );

  ipcMain.on(
    'show-board-context-menu',
    (e, params: IpcShowBoardContextMenu): void => {
      showBoardContextMenu(e, params);
    }
  );

  ipcMain.handle('get-all-extensions', (): Promise<Extension[]> => {
    return new Promise((resolve) => {
      const allExts = getAllExtensions();
      resolve(allExts);
    });
  });

  ipcMain.handle('delete-extension', (_e, id: string): Promise<void> => {
    return deleteExtension(id);
  });

  ipcMain.handle('install-extension', (_e, id: string): Promise<void> => {
    return installExtension(id);
  });

  ipcMain.on('hide-downloads-preview', () => {
    const mainWindow = getMainWindow();
    mainWindow?.webContents.send('hide-downloads-preview');
  });

  ipcMain.handle('get-bookmarks-providers', (): Promise<BookmarkProvider[]> => {
    return new Promise((resolve) => {
      const bp = getBookmarksProviders();
      resolve(bp);
    });
  });

  ipcMain.handle(
    'get-bookmarks-from-provider',
    (_e: any, provider: BookmarkProvider): Promise<Bookmark[]> => {
      return new Promise((resolve) => {
        const bookmarks = getBookmarksFromProvider(provider);
        resolve(bookmarks);
      });
    }
  );

  ipcMain.handle(
    'import-bookmarks',
    (_e, bookmarks: Partial<Bookmark>[]): Promise<void> => {
      return importBookmarks(bookmarks);
    }
  );

  ipcMain.handle('get-bookmarks-tags', (): Promise<Tag[]> => {
    return getBookmarksTags();
  });

  ipcMain.handle('edit-bookmark', (_e, bookmark: Partial<Bookmark>) => {
    return editBookmark(bookmark);
  });

  ipcMain.handle(
    'find-in-bookmarks',
    (_e, str: string): Promise<Bookmark[]> => {
      return findInBookmarks(str);
    }
  );

  ipcMain.handle('request-capture', (_e, wcId: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (browsers[wcId]) {
        browsers[wcId]
          .capturePage()
          .then((img) => {
            return resolve(img.resize({ width: 185 }).toDataURL());
          })
          .catch(reject);
      } else {
        reject(new Error('WebContentId does not exists.'));
      }
    });
  });

  ipcMain.on('app-clicked', () => {
    getMainWindow()?.webContents.send('app-clicked');
  });

  ipcMain.handle('get-url-to-open', (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      const urlToOpen = getUrlToOpen();
      setUrlToOpen(undefined);
      resolve(urlToOpen);
    });
  });

  ipcMain.handle(
    'find-in-known-domains',
    (_e, input: string): Promise<DomainSuggestion[]> => {
      return new Promise((resolve, reject) => {
        Promise.all([findBookmarksByDomain(input), findHistoryByDomain(input)])
          .then((res) => {
            const result = res.flat();
            resolve(result);
          })
          .catch((e) =>
            reject(new Error(`Error while looking for domains: ${e.message}`))
          );
      });
    }
  );

  ipcMain.handle('is-app-maximized', () => {
    return getMainWindow()?.isMaximized() || false;
  });

  // handle chat
  ipcMain.on('init-chat', () => {
    if (getState('isChatActive') === true) {
      setState('isChatActive', false)
      setState('chat', { username: "", isMagic: false })
      endChat()
      getSelectedView()?.webContents.send('end-chat');
      getSelectedView()?.webContents.send('chat-state', { chatState: {username: '', isMagic: false} });
    } else {
      setState('isChatActive', true)
      initChat()
      getSelectedView()?.webContents.send('init-chat');
      getSelectedView()?.webContents.send('chat-state', { chatState: getState("chat") ?? {username: '', isMagic: false} });
    }
  });

  ipcMain.on('end-chat', () => {
    setState('isChatActive', false)
    setState('chat', {})
    endChat()
    getSelectedView()?.webContents.send('end-chat');
  });

  ipcMain.on('set-chat-username', (_e, usr: string) => {
    setUsername(usr)
    const chat = getState("chat") ?? {}
    chat.username = usr
    setState("chat", chat)
  })

  ipcMain.on('set-chat-magic', (_e, magic: string) => {
    setMagic(magic)
    const chat = getState("chat") ?? {}
    chat.isMagic = true
    setState("chat", chat)
  })

  ipcMain.handle('create-chat-runner', async (_e, runner: ChatRunner) => {
    const [chatRunnerId, _chatRunner] = await createRunner(runner)
    sendChatStateUpdate()
    return chatRunnerId
  })

  ipcMain.on('set-visible-runner', (_e, runnerId: string) => {
    setStateAt('chat.visibleRunner', runnerId)
    sendChatStateUpdate()
  })

  ipcMain.handle('get-chat-state', (_e) => {
    return getState('chat')
  })
};


