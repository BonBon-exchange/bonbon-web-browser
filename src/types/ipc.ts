export type Position = {
  x: number;
  y: number;
};

export type IpcInspectElement = Position;

export type IpcAnalyticsEvent = {
  eventName: string;
  params?: Record<string, string | number | boolean>;
};

export type IpcAnalyticsPage = {
  pageName: string;
  params?: Record<string, string | number | boolean>;
};

export type IpcTabSelect = {
  tabId: string;
};

export type IpcTabPurge = {
  tabId: string;
};

export type IpcSaveTab = {
  tabId: string;
};

export type IpcRenameTab = {
  tabId: string;
  label: string;
};

export type IpcSetWindowsCount = {
  boardId: string;
  count: number;
};

export type IpcSetStoreValue = {
  key: string;
  value: unknown;
};

export type IpcAddHistory = {
  url: string;
  title: string;
};

export type IpcAddBookmark = {
  url: string;
  name: string;
};

export type IpcCertificateErrorAnswer = {
  isTrusted: boolean;
  webContentsId: number;
  fingerprint: string;
};

export type IpcAddDownload = {
  savePath: string;
  startTime: number;
  filename: string;
};

export type IpcPermissionResponse = {
  url: string;
  permission: string;
  response: boolean;
};

export type IpcShowTabContextMenu = Position;

export type IpcShowLeftbarContextMenu = Position;

export type IpcShowBoardContextMenu = Position;
