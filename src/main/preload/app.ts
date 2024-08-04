import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { TFunction } from 'react-i18next';

import { EventParams } from 'types/analytics';
import { Bookmark, Provider, Tag } from 'types/bookmarks';
import { ChatRunner, ChatState, ChatView } from 'types/chat';
import { Download } from 'types/downloads';
import { Extension } from 'types/extensions';
import { Locale } from 'types/i18n';
import {
  IpcAddBookmark,
  IpcAddDownload,
  IpcAddHistory,
  IpcCertificateErrorAnswer,
  IpcInspectElement,
  IpcSetStoreValue,
  IpcSetWindowsCount,
  IpcShowBoardContextMenu,
  IpcShowLeftbarContextMenu,
} from 'types/ipc';
import { DomainSuggestion } from 'types/suggestions';

contextBridge.exposeInMainWorld('app', {
  analytics: {
    event: (eventName: string, params: EventParams) => {
      ipcRenderer.send('analytics-event', { eventName, params });
    },
    page: (pageName: string, params: EventParams) => {
      ipcRenderer.send('analytics-page', { pageName, params });
    },
  },
  board: {
    close: () => {
      ipcRenderer.send('close-active-board');
    },
    selectNext: () => {
      ipcRenderer.send('select-next-board');
    },
    setWindowsCount: (args: IpcSetWindowsCount) => {
      ipcRenderer.send('set-windows-count', args);
    },
  },
  bookmark: {
    findInBookmarks: (str: string): Promise<Bookmark[]> => {
      return ipcRenderer.invoke('find-in-bookmarks', str);
    },
    editBookmark: (bookmark: Partial<Bookmark>): Promise<Bookmark> => {
      return ipcRenderer.invoke('edit-bookmark', bookmark);
    },
    getBookmarksProviders: (): Promise<Provider[]> => {
      return ipcRenderer.invoke('get-bookmarks-providers');
    },
    getBookmarksFromProvider: (provider: Provider): Promise<Bookmark[]> => {
      return ipcRenderer.invoke('get-bookmarks-from-provider', provider);
    },
    importBookmarks: (bookmarks: Partial<Bookmark>[]): Promise<void> => {
      return ipcRenderer.invoke('import-bookmarks', bookmarks);
    },
    getBookmarksTags: (): Promise<Tag[]> => {
      return ipcRenderer.invoke('get-bookmarks-tags');
    },
    isBookmarked: (url: string): Promise<boolean> => {
      return ipcRenderer.invoke('is-bookmarked', url);
    },
    addBookmark: (args: IpcAddBookmark): Promise<Bookmark> => {
      return ipcRenderer.invoke('add-bookmark', args);
    },
    removeBookmark: (url: string): Promise<void> => {
      return ipcRenderer.invoke('remove-bookmark', url);
    },
    getAllBookmarks: (): Promise<Bookmark[]> => {
      return ipcRenderer.invoke('get-all-bookmarks');
    },
  },
  browser: {
    select: (webContentsId: number) => {
      ipcRenderer.send('select-browser', webContentsId);
    },
    selectBrowserView: () => {
      ipcRenderer.send('select-browserView');
    },
    certificateErrorAnswer: (args: IpcCertificateErrorAnswer) => {
      ipcRenderer.send('certificate-error-answer', args);
    },
    requestCapture: (webContentsId: number): Promise<string> => {
      return ipcRenderer.invoke('request-capture', webContentsId);
    },
    getUrlToOpen: (): Promise<string | undefined> => {
      return ipcRenderer.invoke('get-url-to-open');
    },
  },
  chat: {
    createdWebrtcParticipant: (webrtcParticipant: string) => {
      ipcRenderer.send('created-webrtc-participant', webrtcParticipant);
    },
    createdWebrtcOffer: (webrtcOffer: string) => {
      ipcRenderer.send('created-webrtc-offer', webrtcOffer);
    },
    setUsername: (username: string) => {
      ipcRenderer.send('set-chat-username', username);
    },
    setMagic: (magic: string) => {
      ipcRenderer.send('set-chat-magic', magic);
    },
    createRunner: (runner: ChatRunner) => {
      ipcRenderer.invoke('create-chat-runner', runner)
    },
    setState: (state: ChatState) => {
      ipcRenderer.send('set-chat-state', state)
    },
    getState: () => {
      ipcRenderer.invoke('get-chat-state')
    },
    setVisibleRunner: (viewName: ChatView) => {
      ipcRenderer.send('set-visible-runner', viewName)
    },
    init: () => {
      ipcRenderer.send('init-chat')
    }
  },
  config: {
    get: (key: string): Promise<unknown> =>
      ipcRenderer.invoke('get-store-value', key),
    set: (args: IpcSetStoreValue): Promise<void> =>
      ipcRenderer.invoke('set-store-value', args),
  },
  download: {
    removeDownload: (id: number): Promise<void> => {
      return ipcRenderer.invoke('remove-download', id);
    },
    addDownload: (args: IpcAddDownload): Promise<void> => {
      return ipcRenderer.invoke('add-download', args);
    },
    getAllDownloads: (): Promise<Download[]> => {
      return ipcRenderer.invoke('get-all-downloads');
    },
    clearDownloads: (): Promise<void> => {
      return ipcRenderer.invoke('clear-downloads');
    },
    hideDownloadsPreview: () => {
      ipcRenderer.send('hide-downloads-preview');
    },
  },
  extension: {
    getAllExtensions: (): Promise<Extension[]> => {
      return ipcRenderer.invoke('get-all-extensions');
    },
    deleteExtension: (id: string): Promise<void> => {
      return ipcRenderer.invoke('delete-extension', id);
    },
    installExtension: (id: string): Promise<void> => {
      return ipcRenderer.invoke('install-extension', id);
    },
  },
  history: {
    addHistory: (args: IpcAddHistory): Promise<History> => {
      return ipcRenderer.invoke('add-history', args);
    },
    findInHistory: (str: string): Promise<History[]> => {
      return ipcRenderer.invoke('find-in-history', str);
    },
    removeHistory: (id: number): Promise<void> => {
      return ipcRenderer.invoke('remove-history', id);
    },
    clearHistory: (): Promise<void> => {
      return ipcRenderer.invoke('clear-history');
    },
    getAllHistory: (): Promise<History[]> => {
      return ipcRenderer.invoke('get-all-history');
    },
  },
  listener: {
    newWindow: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('new-window', action);
    },
    loadBoard: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('load-board', action);
    },
    purge: (action: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
      ipcRenderer.on('purge', action);
    },
    renameBoard: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('rename-board', action);
    },
    closeWebview: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('close-webview', action);
    },
    closeAllWebview: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('close-all-webview', action);
    },
    closeOthersWebview: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('close-others-webview', action);
    },
    showAppMenu: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('show-app-menu', action);
    },
    certificateError: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('certificate-error', action);
    },
    downloading: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('downloading', action);
    },
    showDownloadsPreview: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('show-downloads-preview', action);
    },
    distributeWindowsEvenly: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('distribute-windows-evenly', action);
    },
    setDefaultWindowSize: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('set-default-window-size', action);
    },
    initChat: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('init-chat', action);
    },
    endChat: (
      action: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.on('end-chat', action);
    },
    chatMessageReceived: (action: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
      ipcRenderer.on('chat-message-received', action);
    },
    createWebrtcOffer: (action: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
      ipcRenderer.on('create-webrtc-offer', action);
    },
    createWebrtcParticipant: (action: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
      ipcRenderer.on('create-webrtc-participant', action);
    },
    webrtcConnectionRequest: (action: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
      ipcRenderer.on('wehrtc-connection-request', action);
    },
    chatState: (action: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
      ipcRenderer.on('chat-state', action);
    }
  },
  off: {
    newWindow: () => {
      ipcRenderer.removeAllListeners('new-window');
    },
    loadBoard: () => {
      ipcRenderer.removeAllListeners('load-board');
    },
    purge: () => {
      ipcRenderer.removeAllListeners('purge');
    },
    renameBoard: () => {
      ipcRenderer.removeAllListeners('rename-board');
    },
    closeWebview: () => {
      ipcRenderer.removeAllListeners('close-webview');
    },
    closeAllWebview: () => {
      ipcRenderer.removeAllListeners('close-all-webview');
    },
    closeOthersWebview: () => {
      ipcRenderer.removeAllListeners('close-others-webview');
    },
    showAppMenu: () => {
      ipcRenderer.removeAllListeners('show-app-menu');
    },
    certificateError: () => {
      ipcRenderer.removeAllListeners('certificate-error');
    },
    downloading: () => {
      ipcRenderer.removeAllListeners('downloading');
    },
    showDownloadsPreview: () => {
      ipcRenderer.removeAllListeners('show-downloads-preview');
    },
    distributeWindowsEvenly: () => {
      ipcRenderer.removeAllListeners('distribute-windows-evenly');
    },
    setDefaultWindowSize: () => {
      ipcRenderer.removeAllListeners('set-default-window-size');
    },
    initChat: (
    ) => {
      ipcRenderer.removeAllListeners('init-chat');
    },
    endChat: (
    ) => {
      ipcRenderer.removeAllListeners('end-chat');
    },
    chatMessageReceived: (
    ) => {
      ipcRenderer.removeAllListeners('chat-message-received');
    },
    createWebrtcOffer: () => {
      ipcRenderer.removeAllListeners('create-webrtc-offer');
    },
    createWebrtcParticipant: () => {
      ipcRenderer.removeAllListeners('create-webrtc-participant');
    },
    webrtcConnectionRequest: () => {
      ipcRenderer.removeAllListeners('wehrtc-connection-request');
    },
    chatState: () => {
      ipcRenderer.removeAllListeners('chat-state');
    }
  },
  tools: {
    inspectElement: (point: IpcInspectElement) => {
      ipcRenderer.send('inspectElement', point);
    },
    toggleDarkMode: () => {
      ipcRenderer.invoke('dark-mode:toggle');
    },
    changeLanguage: (locale: Locale): Promise<TFunction> => {
      return ipcRenderer.invoke('change-language', locale);
    },
    showItemInFolder: (filepath: string) => {
      ipcRenderer.send('show-item-in-folder', filepath);
    },
    showLeftbarContextMenu: (params: IpcShowLeftbarContextMenu) => {
      ipcRenderer.send('show-leftbar-context-menu', params);
    },
    showBoardContextMenu: (params: IpcShowBoardContextMenu) => {
      ipcRenderer.send('show-board-context-menu', params);
    },
    clicked: () => {
      ipcRenderer.send('app-clicked');
    },
    findInKnownDomains: (input: string): Promise<DomainSuggestion[]> => {
      return ipcRenderer.invoke('find-in-known-domains', input);
    },
  },
});
