/* eslint-disable promise/always-return */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-use-before-define */
import React, { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { useGlobalEvents } from 'renderer/App/hooks/useGlobalEvents';
import useChatEvents from 'renderer/App/hooks/useChatEvents';
import { useStoreHelpers } from 'renderer/App/hooks/useStoreHelpers';
import { useAppDispatch, useAppSelector } from 'renderer/App/store/hooks';
import { Loader } from 'renderer/App/components/Loader';
import { About } from 'renderer/App/components/About';
import { setChatState } from 'renderer/App/store/reducers/Chat';

import { AddapsProps } from './Types';

import './style.css';

const Board = lazy(() => import('renderer/App/components/Board'));
const LeftBar = lazy(() => import('renderer/App/components/LeftBar'));
const DownloadsPreview = lazy(
  () => import('renderer/App/components/DownloadsPreview')
);
const Settings = lazy(() => import('renderer/App/components/Settings'));
const Bookmarks = lazy(() => import('renderer/App/components/Bookmarks'));
const History = lazy(() => import('renderer/App/components/History'));
const Downloads = lazy(() => import('renderer/App/components/Downloads'));
const Extensions = lazy(() => import('renderer/App/components/Extensions'));
const Documentation = lazy(
  () => import('renderer/App/components/Documentation')
);
const Popup = lazy(() => import('renderer/App/components/Popup'));
const AppMenu = lazy(() => import('renderer/App/components/AppMenu'));
const Minimap = lazy(() => import('renderer/App/components/Minimap'));

export const Addaps = ({ boardId, chatState }: AddapsProps) => {
  useGlobalEvents();
  useChatEvents();
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.downloads);
  const { board } = useStoreHelpers({ boardId });
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showDownloads, setShowDownloads] = useState<boolean>(false);
  const [showDocumentation, setShowDocumentation] = useState<boolean>(false);
  const [showExtensions, setShowExtensions] = useState<boolean>(false);
  const [showAppMenu, setShowAppMenu] = useState<boolean>(false);
  const [showDownloadsPreview, setShowDownloadsPreview] =
    useState<boolean>(false);
  const [popupTitle, setPopupTitle] = useState<string>('');
  const [popupChildren, setPopupChildren] = useState<React.JSX.Element>();
  const [showMinimap, setShowMinimap] = useState<boolean>(false);
  const { i18n } = useTranslation();
  
  const showAppMenuAction = useCallback(() => {
    setShowAppMenu(!showAppMenu);
    setShowDownloadsPreview(false);
  }, [showAppMenu]);

  const showDownloadsPreviewAction = useCallback(() => {
    if (items.length > 0) {
      setShowDownloadsPreview(!showDownloadsPreview);
      setShowAppMenu(false);
    } else {
      // show downloads
      setShowDownloads(true);
    }
  }, [showDownloadsPreview, items.length]);

  const windowClickListener = () => {
    setShowAppMenu(false);
    setShowDownloadsPreview(false);
    window.app.tools.clicked();
  };

  const minimapMouseEnterListener = () => {
    setShowMinimap(true);
  };

  const showAbout = () => {
    setPopupChildren(<About />);
    setPopupTitle('About');
    setShowPopup(!showPopup);
    window.app.analytics.event('open_about');
  };

  const handleCloseSettings = () => setShowSettings(false);
  const handleCloseBookmarks = () => setShowBookmarks(false);
  const handleCloseHistory = () => setShowHistory(false);
  const handleCloseDownloads = () => setShowDownloads(false);
  const handleCloseDocumentation = () => setShowDocumentation(false);
  const handleCloseExtensions = () => setShowExtensions(false);

  const handleShowSettings = () => setShowSettings(true);
  const handleShowBookmarks = () => setShowBookmarks(true);
  const handleShowHistory = () => setShowHistory(true);
  const handleShowDownloads = () => setShowDownloads(true);
  const handleShowDocumentation = () => setShowDocumentation(true);
  const handleShowExtensions = () => setShowExtensions(true);

  useEffect(() => {
    if (boardId) board.load({ id: boardId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  useEffect(() => {
    window.app.listener.showAppMenu(showAppMenuAction);
    return () => window.app.off.showAppMenu();
  }, [showAppMenuAction]);

  useEffect(() => {
    window.app.listener.showDownloadsPreview(showDownloadsPreviewAction);
    return () => window.app.off.showDownloadsPreview();
  }, [showDownloadsPreviewAction]);

  useEffect(() => {
    window.addEventListener('click', windowClickListener);
    return () => window.removeEventListener('click', windowClickListener);
  }, []);

  useEffect(() => {
    document
      .querySelector('#Minimap__detection-zone')
      ?.addEventListener('mouseenter', minimapMouseEnterListener);
    return () =>
      document
        .querySelector('#Minimap__detection-zone')
        ?.removeEventListener('mouseenter', minimapMouseEnterListener);
  }, []);

  useEffect(() => {
    if (chatState) dispatch(setChatState(chatState))
  }, [dispatch, chatState])

  return (
    <Suspense fallback={<Loader />}>
      <div
        id="Addaps__container"
        data-boardid={boardId}
        className={clsx({
          'justify-content-right':
            i18n.language === 'ar' || i18n.language === 'fa',
        })}
      >
        <div id="Addaps__background" />
        <LeftBar/>
        <Board
          boardId={boardId}
          isFullSize={
            showSettings ||
            showBookmarks ||
            showHistory ||
            showDownloads ||
            showDocumentation ||
            showExtensions
          }
        />
        {showPopup && (
          <Popup title={popupTitle} closePopup={() => setShowPopup(false)}>
            {popupChildren}
          </Popup>
        )}
        {showAppMenu && (
          <AppMenu
            showAbout={showAbout}
            showSettings={handleShowSettings}
            showBookmarks={handleShowBookmarks}
            showHistory={handleShowHistory}
            showDownloads={handleShowDownloads}
            showDocumentation={handleShowDocumentation}
            showExtensions={handleShowExtensions}
          />
        )}
        {showDownloadsPreview && <DownloadsPreview />}
        {showSettings && <Settings handleClose={handleCloseSettings} />}
        {showBookmarks && <Bookmarks handleClose={handleCloseBookmarks} />}
        {showHistory && <History handleClose={handleCloseHistory} />}
        {showDownloads && <Downloads handleClose={handleCloseDownloads} />}
        {showExtensions && <Extensions handleClose={handleCloseExtensions} />}
        {showDocumentation && (
          <Documentation handleClose={handleCloseDocumentation} />
        )}
        <div id="Minimap__detection-zone" />
        {showMinimap && <Minimap handleHide={() => setShowMinimap(false)} />}
      </div>
    </Suspense>
  );
};
