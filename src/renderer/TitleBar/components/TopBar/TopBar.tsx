/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-use-before-define */
import React, { useEffect, useCallback, useState } from 'react';
import { v4 } from 'uuid';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import clsx from 'clsx';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Reorder } from 'framer-motion';
import DownloadingIcon from '@mui/icons-material/Downloading';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { useAppDispatch, useAppSelector } from 'renderer/TitleBar/store/hooks';
import {
  addTab,
  setActiveTab,
  setIsRenaming,
  renameTab,
  removeTab,
  setWindowsCount,
  TabsState,
  removeAllTabs,
  removeAllTabsExcept,
  TabProps,
  setTabs,
} from 'renderer/TitleBar/store/reducers/Tabs';
import { AppControls } from 'renderer/TitleBar/components/AppControls';

import './style.scss';
import Magic from 'renderer/TitleBar/components/Magic/Magic';
import { DownloadState } from './Types';

export const TopBar = () => {
  const [downloadState, setDownloadState] = useState<DownloadState>(null);
  const { tabs, activeTab, isRenaming } = useAppSelector(
    (state) => state.tabs as TabsState
  );
  const dispatch = useAppDispatch();

  const pushTab = useCallback(
    (params: { id?: string; label?: string }) => {
      const id = params.id || v4();
      const newTab = {
        id,
        label: params.label || 'New collection',
      };

      dispatch(addTab(newTab));
      window.titleBar.tabs.select(id);
      window.titleBar.analytics.event('add_board');
    },
    [dispatch]
  );

  const tabOnKeyPress = (
    e: React.KeyboardEvent<HTMLDivElement>,
    id: string
  ) => {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      dispatch(setIsRenaming(null));
      const target = e.target as HTMLInputElement;
      dispatch(renameTab({ id, label: target?.value }));
      window.titleBar.tabs.rename({ tabId: id, label: target?.value });
    }
    if (e.key === 'Escape') {
      dispatch(setIsRenaming(null));
    }
  };

  const switchBoard = useCallback(
    (tabId: string) => {
      if (!isRenaming) {
        window.titleBar.tabs.select(tabId);
        window.titleBar.analytics.event('switch_board');
      }
    },
    [isRenaming]
  );

  const dblclickEventListener = useCallback(
    (tab: Element) => dispatch(setIsRenaming(tab.getAttribute('data-tabid'))),
    [dispatch]
  );

  const openTabListener = useCallback(
    (_e: unknown, args: { id?: string; label?: string }) => {
      if (tabs?.find((t) => t.id === args?.id)) {
        if (args.id) switchBoard(args.id);
      } else {
        pushTab(args);
      }
    },
    [pushTab, switchBoard, tabs]
  );

  const closeTabListener = useCallback(
    (_e: unknown, args: { x: number; y: number }) => {
      const el = document.elementFromPoint(args.x, args.y);
      const tabId = el?.getAttribute('data-tabid');
      if (tabId) {
        dispatch(removeTab(tabId));
      }
    },
    [dispatch]
  );

  const closeAllTabListener = useCallback(() => {
    dispatch(removeAllTabs(undefined));
  }, [dispatch]);

  const closeActiveTabListener = useCallback(() => {
    const tabId = activeTab;
    if (tabId) {
      dispatch(removeTab(tabId));
      window.titleBar.tabs.purge(tabId);
    }
  }, [dispatch, activeTab]);

  const renameTabListener = useCallback(
    (_e: unknown, args: { x: number; y: number }) => {
      const el = document.elementFromPoint(args.x, args.y);
      const tabId = el?.getAttribute('data-tabid');
      if (tabId) {
        dispatch(setIsRenaming(tabId));
      }
    },
    [dispatch]
  );

  const saveBoardListener = useCallback(
    (_e: unknown, args: { x: number; y: number }) => {
      const el = document.elementFromPoint(args.x, args.y);
      const tabId = el?.getAttribute('data-tabid');
      if (tabId) {
        window.titleBar.tabs.save(tabId);
      }
    },
    []
  );

  const setWindowsCountListener = useCallback(
    (_e: unknown, args: { boardId: string; count: number }) => {
      dispatch(setWindowsCount({ id: args.boardId, count: args.count }));
    },
    [dispatch]
  );

  const selectNextBoardListener = useCallback(() => {
    const activeTabIndex = tabs.findIndex((t) => t.id === activeTab);
    const nextTabIndex =
      activeTabIndex === tabs.length - 1 ? 0 : activeTabIndex + 1;
    const nextTabId = tabs[nextTabIndex].id;
    dispatch(setActiveTab(nextTabId));
  }, [activeTab, dispatch, tabs]);

  const colorSchemeChangeListener = (e: MediaQueryListEvent) => {
    const colorScheme = e.matches ? 'dark-theme' : 'light-theme';
    // @ts-ignore
    window.document.querySelector('body').className = colorScheme;
  };

  const handleCloseTab = (tabId: string) => {
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const selectTabIndex = tabIndex > 0 ? tabIndex - 1 : 1;
    if (tabs[selectTabIndex] && tabIndex !== selectTabIndex) {
      dispatch(setActiveTab(tabs[selectTabIndex].id));
    }
    dispatch(removeTab(tabId));
  };

  const wheelEventListener = (evt: Event) => {
    const scrollContainer = document.querySelector('#TopBar__tabs-container');
    const event = evt as WheelEvent;
    evt.preventDefault();
    scrollContainer?.scroll(
      Number(event.deltaY) + Number(scrollContainer?.scrollLeft),
      0
    );
  };

  const closeOthersTabListener = useCallback(
    (_e: unknown, args: { x: number; y: number }) => {
      const el = document.elementFromPoint(args.x, args.y);
      const tabId = el?.getAttribute('data-tabid');
      if (tabId) {
        dispatch(removeAllTabsExcept(tabId));
      }
    },
    [dispatch]
  );

  const downloadStateListener = useCallback(
    (_e: unknown, state: DownloadState) => {
      setDownloadState(state);
    },
    []
  );

  const hideDownloadsPreviewListener = useCallback(() => {
    setDownloadState(null);
  }, []);

  const removeExtensionListener = useCallback((_e: unknown, id: string) => {
    const bal = document.querySelector('browser-action-list');
    const balRoot = bal && bal.shadowRoot;

    const toRemove = balRoot && balRoot.getElementById(id);
    toRemove?.remove();
  }, []);

  const handleReorder = (newOrder: TabProps[]) => {
    dispatch(setTabs(newOrder));
  };

  const appClickedListener = useCallback(() => {
    dispatch(setIsRenaming(null));
  }, [dispatch]);

  useEffect(() => {
    // @ts-ignore
    window.document.querySelector('body').className = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
      ? 'dark-theme'
      : 'light-theme';

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', colorSchemeChangeListener);

    return () =>
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', colorSchemeChangeListener);
  }, []);

  useEffect(() => {
    document.querySelectorAll('.TopBar__tab').forEach((tab) => {
      tab.addEventListener('dblclick', () => dblclickEventListener(tab));
    });
    return () =>
      document.querySelectorAll('.TopBar__tab').forEach((tab) => {
        tab.removeEventListener('dblclick', () => dblclickEventListener(tab));
      });
  }, [dblclickEventListener, tabs]);

  useEffect(() => {
    switchBoard(activeTab);
  }, [switchBoard, activeTab]);

  useEffect(() => {
    window.titleBar.listener.openTab(openTabListener);
    return () => window.titleBar.off.openTab();
  }, [openTabListener]);

  useEffect(() => {
    window.titleBar.listener.closeTab(closeTabListener);
    return () => window.titleBar.off.closeTab();
  }, [closeTabListener]);

  useEffect(() => {
    window.titleBar.listener.renameTab(renameTabListener);
    return () => window.titleBar.off.renameTab();
  }, [renameTabListener]);

  useEffect(() => {
    window.titleBar.listener.saveBoard(saveBoardListener);
    return () => window.titleBar.off.saveBoard();
  }, [saveBoardListener]);

  useEffect(() => {
    window.titleBar.listener.closeActiveTab(closeActiveTabListener);
    return () => window.titleBar.off.closeActiveTab();
  }, [closeActiveTabListener]);

  useEffect(() => {
    window.titleBar.listener.selectNextBoard(selectNextBoardListener);
    return () => window.titleBar.off.selectNextBoard();
  }, [selectNextBoardListener]);

  useEffect(() => {
    window.titleBar.listener.setWindowsCount(setWindowsCountListener);
    return () => window.titleBar.off.setWindowsCount();
  }, [setWindowsCountListener]);

  useEffect(() => {
    window.titleBar.listener.closeAllTab(closeAllTabListener);
    return () => window.titleBar.off.closeAllTab();
  }, [closeAllTabListener]);

  useEffect(() => {
    window.titleBar.listener.closeOthersTab(closeOthersTabListener);
    return () => window.titleBar.off.closeOthersTab();
  }, [closeOthersTabListener]);

  useEffect(() => {
    window.titleBar.listener.downloadState(downloadStateListener);
    return () => window.titleBar.off.downloadState();
  }, [downloadStateListener]);

  useEffect(() => {
    window.titleBar.listener.removeExtension(removeExtensionListener);
    return () => window.titleBar.off.removeExtension();
  }, [removeExtensionListener]);

  useEffect(() => {
    window.titleBar.listener.hideDownloadsPreview(hideDownloadsPreviewListener);
    return () => window.titleBar.off.hideDownloadsPreview();
  }, [hideDownloadsPreviewListener]);

  useEffect(() => {
    window.titleBar.listener.appClicked(appClickedListener);
    return () => window.titleBar.off.appClicked();
  }, [appClickedListener]);

  useEffect(() => {
    if (tabs.length === 0) pushTab({});
  }, [tabs, pushTab]);

  useEffect(() => {
    if (isRenaming) {
      const target = document.getElementById(
        'TopBar__tab-renaming'
      ) as HTMLInputElement;
      target?.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const scrollContainer = document.querySelector('#TopBar__tabs-container');
    scrollContainer?.addEventListener('wheel', wheelEventListener);
    return () =>
      scrollContainer?.removeEventListener('wheel', wheelEventListener);
  }, []);

  return (
    <div
      id="TopBar__container"
      className={clsx({
        macTitleBar: window.titleBar.os.getPlatform() === 'darwin',
      })}
    >
      {/* {window.titleBar.os.getPlatform() === 'darwin' ? <Magic /> : null} */}

      <Reorder.Group
        axis="x"
        values={tabs}
        onReorder={handleReorder}
        as="div"
        id="TopBar__tabs-container"
      >
        {tabs.map((t) => {
          return (
            <Reorder.Item
              key={t.id}
              value={t}
              as="div"
              className="TopBar__tab-container"
            >
              <div
                className={clsx({
                  TopBar__tab: true,
                  selected: activeTab === t.id,
                  renaming: isRenaming === t.id,
                })}
                key={t.id}
                onClick={() => dispatch(setActiveTab(t.id))}
                data-tabid={t.id}
              >
                {isRenaming === t.id ? (
                  <TextField
                    label="Board name"
                    defaultValue={t.label}
                    variant="standard"
                    onKeyDown={(e) => tabOnKeyPress(e, t.id)}
                    id="TopBar__tab-renaming"
                  />
                ) : (
                  `${t.label} (${t.windowsCount || '0'})`
                )}
              </div>
              <div className="TopBar__closeTab">
                {isRenaming !== t.id && (
                  <CloseIcon onClick={() => handleCloseTab(t.id)} />
                )}
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <div id="TopBar__addBoard" onClick={() => pushTab({})}>
        <AddIcon />
      </div>
      <div id="TopBar__controls">
        {/* @ts-ignore */}
        <browser-action-list />
        <div id="TopBar__menu-container">
          {downloadState && (
            <div
              className="TopBar__menu-item"
              onClick={() => window.titleBar.app.showDownloadsPreview()}
            >
              {downloadState === 'progressing' ? (
                <DownloadingIcon />
              ) : (
                <FileDownloadIcon />
              )}
            </div>
          )}
          <div
            className="TopBar__menu-item"
            onClick={() => window.titleBar.app.showMenu()}
          >
            <MenuIcon />
          </div>
        </div>
      </div>
      {window.titleBar.os.getPlatform() !== 'darwin' && <AppControls />}
    </div>
  );
};
