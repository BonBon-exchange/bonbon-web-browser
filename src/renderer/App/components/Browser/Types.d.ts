export interface BrowserProps {
  id: string;
  url: string;
  top: number;
  left: number;
  height: number;
  width: number;
  firstRendering?: boolean;
  favicon?: string;
  title?: string;
  webContentsId?: number;
  isLoading: boolean;
  isMinimized: boolean;
  certificateErrorFingerprint?: string | null;
  isSearching?: boolean;
  capture?: string;
  permissionRequest?: {
    url: string;
    permission: string;
  }
  browserIndex?: number;
}
