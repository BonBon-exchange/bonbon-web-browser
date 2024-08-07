/* eslint-disable import/prefer-default-export */
import { Electron } from 'namespaces/_electronist';

export const getContainerFromBrowserId = (browserId: string) => {
  const container = document.querySelector(`#Browser__${browserId}`);
  return container;
};

export const getWebviewFromBrowserId = (browserId: string) => {
  const container = getContainerFromBrowserId(browserId);
  const webview: Electron.WebviewTag | undefined | null =
    container?.querySelector('webview');

  return webview;
};
