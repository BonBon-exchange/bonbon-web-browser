import { EventParams } from "types/analytics";
import { IpcInspectElement, IpcRenameTab, IpcShowTabContextMenu } from "types/ipc";

declare global {
  interface Window {
    titleBar: {
      app: {
        close: () => void;
        minimize: () => void;
        maximize: () => void;
        showMenu: () => void;
        showDownloadsPreview: () => void;
        showTabContextMenu: (params: IpcShowTabContextMenu) => void;
        isMaximized: () => Promise<boolean>;
      };
      analytics: {
        event: (eventName: string, params?: EventParams) => void;
      };
      tools: {
        inspectElement: (point: IpcInspectElement) => void;
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
        closeOthersTab: (action: unknown) => void;
        downloadState: (action: unknown) => void;
        removeExtension: (action: unknown) => void;
        hideDownloadsPreview: (action: unknown) => void;
        appClicked: (action: unknown) => void;
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
        closeOthersTab: () => void;
        downloadState: () => void;
        removeExtension: () => void;
        hideDownloadsPreview: () => void;
        appClicked: () => void;
      };
      tabs: {
        select: (tabId: string) => void;
        purge: (tabId: string) => void;
        save: (tabId: string) => void;
        rename: (args: IpcRenameTab) => void;
      };
      screens: {
        library: () => void;
        settings: () => void;
      };
      os: {
        getPlatform: () => string;
      };
      chat: {
        init: () => void;
        end: () => void;
      };
    };
  };
};

export { };
