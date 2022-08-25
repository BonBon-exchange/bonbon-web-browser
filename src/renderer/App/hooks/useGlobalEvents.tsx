/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/prefer-default-export */
import { useCallback, useEffect, useState } from 'react';
import { IpcRendererEvent } from 'electron';

import { useStoreHelpers } from 'renderer/App/hooks/useStoreHelpers';
import {
  removeBrowser,
  removeAllBrowsers,
  removeAllBrowsersExcept,
  renameBoard,
  updateBrowserCertificateErrorFingerprint,
  setBoardHeight,
  updateBrowser,
} from 'renderer/App/store/reducers/Board';
import { setDownloadItem } from 'renderer/App/store/reducers/Downloads';
import { useAppDispatch } from 'renderer/App/store/hooks';
import { DownloadState } from 'renderer/TitleBar/components/TopBar/Types';
import { getContainerFromBrowserId } from 'renderer/App/helpers/dom';
import { Position } from 'types/ipc';
import { useBoard } from './useBoard';
import { useBrowserMethods } from './useBrowserMethods';

export const useGlobalEvents = () => {
  const { browser, board } = useStoreHelpers();
  const dispatch = useAppDispatch();
  const boardState = useBoard();
  const { focus, next, disablePointerEventsForAll, enablePointerEventsForAll } =
    useBrowserMethods();
  const [isPointerEventDisabled, setIsPointerEventDisabled] =
    useState<boolean>(false);

  const keyUpListener = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        enablePointerEventsForAll();
        setIsPointerEventDisabled(false);
      }
    },
    [enablePointerEventsForAll]
  );

  const getActiveWebview = useCallback(() => {
    if (boardState.activeBrowser) {
      const container = getContainerFromBrowserId(boardState.activeBrowser);
      const webview: Electron.WebviewTag | undefined | null =
        container?.querySelector('webview');

      return webview;
    }
    return null;
  }, [boardState.activeBrowser]);

  const keyDownListener = useCallback(
    (e: KeyboardEvent) => {
      const webview = getActiveWebview();
      if (e.key === 'Alt') {
        if (!isPointerEventDisabled) {
          disablePointerEventsForAll();
          setIsPointerEventDisabled(true);
        }
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'Tab') {
        if (boardState.browsers.length > 0) {
          if (next) focus(next);
        }
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        window.app.board.selectNext();
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 't') {
        browser.add({});
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        browser.reopenLastClosed();
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'r') {
        if (webview) webview.reload();
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'w') {
        if (boardState.activeBrowser) browser.close(boardState.activeBrowser);
        else board.close();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        board.close();
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'f') {
        if (boardState.activeBrowser) {
          browser.toggleSearch(boardState.activeBrowser);
          webview?.stopFindInPage('clearSelection');
        }
      }
    },
    [
      browser,
      boardState.activeBrowser,
      board,
      boardState.browsers,
      focus,
      next,
      disablePointerEventsForAll,
      isPointerEventDisabled,
      getActiveWebview,
    ]
  );

  const scrollListener = useCallback(() => {
    const boardContainer = document.querySelector(
      '#Board__container'
    ) as HTMLDivElement;
    const containerHeight = boardContainer.clientHeight;
    const heightDistance =
      document.documentElement.getBoundingClientRect().bottom * -1 +
      window.innerHeight -
      30;
    if (Number(containerHeight) - heightDistance < 100) {
      const newHeight = Number(containerHeight) + 100;
      // @ts-ignore
      document.querySelector(
        '#Board__container'
        // @ts-ignore
      ).style.height = `${newHeight}px`;
      dispatch(setBoardHeight(newHeight));
    }
  }, [dispatch]);

  const newWindowAction = useCallback(
    (_e: IpcRendererEvent, args: { url: string }) => browser.add(args),
    [browser]
  );

  const closeWebviewAction = useCallback(
    (_e: IpcRendererEvent, args: Position) => {
      const el = document.elementFromPoint(args.x, args.y);
      const browserId = el?.getAttribute('data-browserid');
      if (browserId) {
        dispatch(removeBrowser(browserId));
        window.app.browser.selectBrowserView();
      }
    },
    [dispatch]
  );

  const closeOthersWebviewAction = useCallback(
    (_e: IpcRendererEvent, args: Position) => {
      const el = document.elementFromPoint(args.x, args.y);
      const browserId = el?.getAttribute('data-browserid');
      if (browserId) {
        dispatch(removeAllBrowsersExcept(browserId));
        window.app.browser.selectBrowserView();
      }
    },
    [dispatch]
  );

  const closeAllWebviewAction = useCallback(() => {
    window.app.browser.selectBrowserView();
    dispatch(removeAllBrowsers());
  }, [dispatch]);

  const matchMediaListener = useCallback((e: { matches: boolean }) => {
    const colorScheme = e.matches ? 'dark-theme' : 'light-theme';
    if (window.document.querySelector('body')?.className !== colorScheme) {
      //@ts-ignore
      window.document.querySelector('body').className = colorScheme;
      window.app.analytics.event('toggle_darkmode', { theme: colorScheme });
    }
  }, []);

  const renameBoardAction = useCallback(
    (_e: IpcRendererEvent, args: { label: string }) => {
      dispatch(renameBoard(args.label));
    },
    [dispatch]
  );

  const downloadingAction = useCallback(
    (
      _e: IpcRendererEvent,
      args: {
        savePath: string;
        filename: string;
        progress: number;
        etag: string;
        startTime: number;
        state: DownloadState;
      }
    ) => {
      dispatch(setDownloadItem(args));
      if (args.state === 'completed') {
        window.app.download
          .addDownload({
            savePath: args.savePath,
            filename: args.filename,
            startTime: args.startTime,
          })
          .catch(console.log);
      }
    },
    [dispatch]
  );

  const certificateErrorAction = useCallback(
    (
      _e: IpcRendererEvent,
      args: { webContentsId: number; fingerprint: string }
    ) => {
      const browserId = boardState.browsers.find(
        (b) => b.webContentsId === args.webContentsId
      )?.id;
      if (browserId) {
        dispatch(
          updateBrowserCertificateErrorFingerprint({
            browserId,
            certificateErrorFingerprint: args.fingerprint,
          })
        );
      }
    },
    [dispatch, boardState.browsers]
  );

  const distributeWindowsEvenlyAction = useCallback(() => {
    board.distributeWindowsEvenlyDefault();
  }, [board]);

  const setDefaultWindowSizeAction = useCallback(
    (_e: IpcRendererEvent, wcId: number) => {
      const brow = boardState.browsers.find((b) => b.webContentsId === wcId);
      window.app.config.set({
        key: 'browsing.height',
        value: brow?.height,
      });
      window.app.config.set({
        key: 'browsing.width',
        value: brow?.width,
      });
      window.app.config.set({
        key: 'browsing.size',
        value: 'defined',
      });
    },
    [boardState.browsers]
  );

  const permissionRequestAction = useCallback(
    (
      _e: IpcRendererEvent,
      args: { url: string; permission: string; webContentsId: number }
    ) => {
      const browserId = boardState.browsers.find(
        (b) => b.webContentsId === args.webContentsId
      )?.id;
      if (browserId) {
        dispatch(
          updateBrowser({
            browserId,
            params: {
              permissionRequest: { url: args.url, permission: args.permission },
            },
          })
        );
      }
    },
    [boardState.browsers, dispatch]
  );

  useEffect(() => {
    window.app.listener.permissionRequest(permissionRequestAction);
    return () => window.app.off.permissionRequest();
  }, [permissionRequestAction]);

  useEffect(() => {
    window.app.listener.setDefaultWindowSize(setDefaultWindowSizeAction);
    return () => window.app.off.setDefaultWindowSize();
  }, [setDefaultWindowSizeAction]);

  useEffect(() => {
    window.app.listener.downloading(downloadingAction);
    return () => window.app.off.downloading();
  }, [downloadingAction]);

  useEffect(() => {
    window.app.listener.certificateError(certificateErrorAction);
    return () => window.app.off.certificateError();
  }, [certificateErrorAction]);

  useEffect(() => {
    window.app.listener.newWindow(newWindowAction);
    return () => window.app.off.newWindow();
  }, [newWindowAction]);

  useEffect(() => {
    window.app.listener.closeWebview(closeWebviewAction);
    return () => window.app.off.closeWebview();
  }, [closeWebviewAction]);

  useEffect(() => {
    window.app.listener.closeAllWebview(closeAllWebviewAction);
    return () => window.app.off.closeAllWebview();
  }, [closeAllWebviewAction]);

  useEffect(() => {
    window.app.listener.closeOthersWebview(closeOthersWebviewAction);
    return () => window.app.off.closeOthersWebview();
  }, [closeOthersWebviewAction]);

  useEffect(() => {
    window.app.listener.renameBoard(renameBoardAction);
    return () => window.app.off.renameBoard();
  }, [renameBoardAction]);

  useEffect(() => {
    window.app.listener.distributeWindowsEvenly(distributeWindowsEvenlyAction);
    return () => window.app.off.distributeWindowsEvenly();
  }, [distributeWindowsEvenlyAction]);

  useEffect(() => {
    window.addEventListener('keydown', keyDownListener, false);
    return () => window.removeEventListener('keydown', keyDownListener);
  }, [keyDownListener]);

  useEffect(() => {
    window.addEventListener('keyup', keyUpListener, false);
    return () => window.removeEventListener('keyup', keyUpListener);
  }, [keyUpListener]);

  useEffect(() => {
    window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  }, [scrollListener]);

  useEffect(() => {
    //@ts-ignore
    window.document.querySelector('body').className = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
      ? 'dark-theme'
      : 'light-theme';

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', matchMediaListener);

    return () =>
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', matchMediaListener);
  }, [matchMediaListener]);
};
