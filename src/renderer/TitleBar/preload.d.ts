declare global {
  interface Window {
    titleBar: {
      app: {
        close: () => void;
      };
      analytics: {
        event: (eventName: string, params?: Record<string, string>) => void;
      };
      tools: {
        inspectElement: (point: { x: number; y: number }) => void;
      };
      listener: {
        openTab: (action: unknown) => void;
        closeTab: (action: unknown) => void;
        renameTab: (action: unknown) => void;
        saveBoard: (action: unknown) => void;
        closeActiveTab: (action: unknown) => void;
        selectNextBoard: (action: unknown) => void;
        setWindowsCount: (action: unknown) => void;
        closeAllTab: (action: unknown) => void;
      };
      off: {
        openTab: () => void;
        closeTab: () => void;
        renameTab: () => void;
        saveBoard: () => void;
        closeActiveTab: () => void;
        selectNextBoard: () => void;
        setWindowsCount: () => void;
        closeAllTab: () => void;
      };
      tabs: {
        select: (tabId: string) => void;
        purge: (tabId: string) => void;
        save: (tabId: string) => void;
        rename: ({ tabId, label }: { tabId: string; label: string }) => void;
      };
      screens: {
        library: () => void;
        settings: () => void;
      };
      os: {
        getPlatform: () => string;
      }
    };
  }
}

export {};
