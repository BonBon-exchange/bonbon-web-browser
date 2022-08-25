/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
export const mockWindow = () => {
  Object.defineProperty(window, 'app', {
    value: {
      analytics: {
        event: jest.fn(),
        page: jest.fn(),
      },
      board: {
        close: jest.fn(),
        selectNext: jest.fn(),
        setWindowsCount: jest.fn(),
      },
      bookmark: {
        isBookmarked: jest.fn(() => Promise.resolve()),
        addBookmark: jest.fn(() => Promise.resolve()),
        removeBookmark: jest.fn(() => Promise.resolve()),
        getAllBookmarks: jest.fn(() => Promise.resolve()),
        findInBookmarks: jest.fn(() => Promise.resolve()),
        getBookmarksProviders: jest.fn(() => Promise.resolve()),
        getBookmarksFromProvider: jest.fn(() => Promise.resolve()),
        importBookmarks: jest.fn(() => Promise.resolve()),
        getBookmarksTags: jest.fn(() => Promise.resolve()),
        editBookmark: jest.fn(() => Promise.resolve()),
      },
      browser: {
        select: jest.fn(),
        selectBrowserView: jest.fn(),
        certificateErrorAnswer: jest.fn(),
        requestCapture: jest.fn(() => Promise.resolve()),
        getUrlToOpen: jest.fn(() => Promise.resolve()),
        permissionResponse: jest.fn(),
      },
      config: {
        get: (key: string) => {
          switch (key) {
            case 'browsing.width':
              return Promise.resolve(600);

            case 'browsing.height':
              return Promise.resolve(800);

            default:
              return Promise.resolve();
          }
        },
        set: jest.fn(() => Promise.resolve()),
      },
      download: {
        addDownload: jest.fn(() => Promise.resolve()),
        getAllDownloads: jest.fn(() => Promise.resolve()),
        clearDownloads: jest.fn(() => Promise.resolve()),
        removeDownload: jest.fn(() => Promise.resolve()),
        hideDownloadsPreview: jest.fn(),
      },
      extension: {
        getAllExtensions: jest.fn(() => Promise.resolve()),
        deleteExtension: jest.fn(() => Promise.resolve()),
        installExtension: jest.fn(() => Promise.resolve()),
      },
      history: {
        addHistory: jest.fn(() => Promise.resolve()),
        findInHistory: jest.fn(() => Promise.resolve()),
        removeHistory: jest.fn(() => Promise.resolve()),
        getAllHistory: jest.fn(() => Promise.resolve()),
        clearHistory: jest.fn(() => Promise.resolve()),
      },
      listener: {
        newWindow: jest.fn(),
        loadBoard: jest.fn(),
        purge: jest.fn(),
        renameBoard: jest.fn(),
        closeWebview: jest.fn(),
        closeAllWebview: jest.fn(),
        closeOthersWebview: jest.fn(),
        showAppMenu: (action: (event: Event, ...args: unknown[]) => void) => {
          window.addEventListener('show-app-menu', action);
        },
        certificateError: jest.fn(),
        downloading: jest.fn(),
        showDownloadsPreview: jest.fn(),
        distributeWindowsEvenly: jest.fn(),
        setDefaultWindowSize: jest.fn(),
        permissionRequest: jest.fn(),
      },
      off: {
        newWindow: jest.fn(),
        loadBoard: jest.fn(),
        purge: jest.fn(),
        renameBoard: jest.fn(),
        closeWebview: jest.fn(),
        closeAllWebview: jest.fn(),
        closeOthersWebview: jest.fn(),
        showAppMenu: jest.fn(),
        certificateError: jest.fn(),
        downloading: jest.fn(),
        showDownloadsPreview: jest.fn(),
        distributeWindowsEvenly: jest.fn(),
        setDefaultWindowSize: jest.fn(),
        permissionRequest: jest.fn(),
      },
      tools: {
        inspectElement: jest.fn(),
        toggleDarkMode: jest.fn(),
        changeLanguage: jest.fn(() => Promise.resolve()),
        showItemInFolder: jest.fn(),
        showTabContextMenu: jest.fn(),
        showBoardContextMenu: jest.fn(),
        clicked: jest.fn(),
        findInKnownDomains: jest.fn(() => Promise.resolve()),
      },
    },
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.scrollBy = jest.fn();
  window.scrollBy = jest.fn();
};
