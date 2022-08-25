/* eslint-disable promise/always-return */
/* eslint-disable promise/no-nesting */
/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-use-before-define */
import clsx from 'clsx';
import { motion } from 'framer-motion';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { Rnd } from 'react-rnd';

import { BrowserControlBar } from 'renderer/App/components/BrowserControlBar';
import { BrowserTopBar } from 'renderer/App/components/BrowserTopBar';
import { CertificateErrorPage } from 'renderer/App/components/CertificateErrorPage';
import { PermissionRequest } from 'renderer/App/components/PermissionRequest';
import { SearchForm } from 'renderer/App/components/SearchForm';
import { useBoard } from 'renderer/App/hooks/useBoard';
import { useBrowserEvents } from 'renderer/App/hooks/useBrowserEvents';
import { useBrowserMethods } from 'renderer/App/hooks/useBrowserMethods';
import { useStoreHelpers } from 'renderer/App/hooks/useStoreHelpers';
import { useAppDispatch } from 'renderer/App/store/hooks';
import {
  setLastResizedBrowserDimensions,
  toggleBoardFullSize,
  updateBrowser,
} from 'renderer/App/store/reducers/Board';

import { BrowserProps } from './Types';

import './style.scss';

export const Browser: React.FC<BrowserProps> = ({
  id,
  url,
  top,
  left,
  height,
  width,
  firstRendering,
  favicon,
  title,
  isLoading,
  isMinimized,
  certificateErrorFingerprint,
  webContentsId,
  isSearching,
  capture,
  permissionRequest,
  browserIndex,
}) => {
  const dispatch = useAppDispatch();
  const {
    enablePointerEventsForAll,
    disablePointerEventsForAll,
    focus,
    bringBrowserToTheFront,
  } = useBrowserMethods();
  const helpers = useStoreHelpers();
  const board = useBoard();
  const [firstRenderingState, setFirstRenderingState] = useState<boolean>(
    firstRendering || true
  );
  const [renderedUrl, setRenderedUrl] = useState<string>('');
  const container = useRef<HTMLDivElement>(null);
  const [x, setX] = useState<number>(left);
  const [y, setY] = useState<number>(top);
  const [rndWidth, setRndWidth] = useState<number>(width);
  const [rndHeight, setRndHeight] = useState<number>(height);
  const [scrollY, setScrollY] = useState<null | number>(null);
  const [hasBeenActive, setHasBeenActive] = useState<boolean>(
    board.activeBrowser === id
  );
  const blockScrollTimer = useRef<any>(null);
  const rndRef = useRef<Rnd>(null);
  const webviewRef = useRef<Electron.WebviewTag>(null);
  const [lastScreenshot, setLastScreenshot] = useState<number>(0);
  useBrowserEvents(id);

  const edgeLeft = document.querySelector('.Board__edge-snap-left');
  const edgeRight = document.querySelector('.Board__edge-snap-right');
  const edgeMaximized = document.querySelector('.Board__edge-snap-maximized');
  const boardContainer = document.querySelector('#Board__container');

  const toggleFullSizeBrowser = useCallback(() => {
    dispatch(toggleBoardFullSize());
  }, [dispatch]);

  const zoomEdgeClass = (edgeClass: Element | null, max = false) => {
    // @ts-ignore
    edgeClass.style.opacity = '0.3';
    // @ts-ignore
    edgeClass.style.height = 'calc(100vh - 30px)';
    // @ts-ignore
    edgeClass.style.width = max ? 'calc(94vw + 5px)' : '47vw';
  };

  const resetEdgeClass = (edgeClass: Element | null) => {
    // @ts-ignore
    edgeClass.style.opacity = '0';
    // @ts-ignore
    edgeClass.style.height = '25vh';
    // @ts-ignore
    edgeClass.style.width = '25vw';
  };

  const onDrag = (_e: any, d: { x: number; y: number }) => {
    if (boardContainer) {
      const edgeRightWidth = container.current?.clientWidth
        ? container.current?.clientWidth
        : 0;
      const edgeRightValue = boardContainer?.clientWidth - edgeRightWidth - 2;
      if (d.y - window.scrollY <= 20) {
        if (!blockScrollTimer.current) {
          resetEdgeClass(edgeLeft);
          resetEdgeClass(edgeRight);
          zoomEdgeClass(edgeMaximized, true);
          setScrollY(window.scrollY);
          blockScrollTimer.current = setTimeout(() => {
            if (window.scrollY > 0) {
              setScrollY(null);
              resetEdgeClass(edgeMaximized);
            }
            blockScrollTimer.current = null;
          }, 1000);
        }
      } else {
        resetEdgeClass(edgeMaximized);

        if (d.x === 0) {
          zoomEdgeClass(edgeLeft);
        } else {
          resetEdgeClass(edgeLeft);
        }
        if (d.x === edgeRightValue) {
          zoomEdgeClass(edgeRight);
        } else {
          resetEdgeClass(edgeRight);
        }
      }
    }
  };

  const onDragStart = () => {
    blockScrollTimer.current = null;
    disablePointerEventsForAll();
  };

  const onDragStop = (_e: any, d: any) => {
    if (boardContainer) {
      const scrollTop = window.pageYOffset;
      resetEdgeClass(edgeRight);
      resetEdgeClass(edgeLeft);
      resetEdgeClass(edgeMaximized);

      const edgeRightWidth = container.current?.clientWidth
        ? container.current?.clientWidth
        : 0;
      const edgeRightValue = boardContainer?.clientWidth - edgeRightWidth - 2;
      const edgeTopValue = d.y - window.scrollY;

      let resizeWidth;
      let resizeHeight;

      switch (d.x) {
        case 0:
          resizeWidth = boardContainer?.clientWidth / 2 - 15;
          resizeHeight = window.innerHeight - 20;
          setX(10);
          setY(10 + scrollTop);
          setRndWidth(resizeWidth);
          setRndHeight(resizeHeight);
          dispatch(
            updateBrowser({
              browserId: id,
              params: {
                top: 10 + scrollTop,
                left: 10,
                width: resizeWidth,
                height: resizeHeight,
              },
            })
          );
          dispatch(
            setLastResizedBrowserDimensions([resizeWidth, resizeHeight])
          );
          break;

        case edgeRightValue:
          resizeWidth = boardContainer?.clientWidth / 2 - 15;
          resizeHeight = window.innerHeight - 20;
          setX(boardContainer?.clientWidth / 2 + 5);
          setY(10 + scrollTop);
          setRndWidth(resizeWidth);
          setRndHeight(resizeHeight);
          dispatch(
            updateBrowser({
              browserId: id,
              params: {
                top: 10 + scrollTop,
                left: boardContainer?.clientWidth / 2 + 5,
                width: resizeWidth,
                height: resizeHeight,
              },
            })
          );
          dispatch(
            setLastResizedBrowserDimensions([resizeWidth, resizeHeight])
          );
          break;

        default:
          if (edgeTopValue <= 0 && scrollY !== null) {
            window.app.config.get('browsing.topEdge').then((res: unknown) => {
              if (res === 'maximize') {
                toggleFullSizeBrowser();
                focus(id, true);
              }
              if (res === 'fit') {
                resizeWidth = boardContainer?.clientWidth - 20;
                resizeHeight = window.innerHeight - 20;
                setX(10);
                setY(10 + scrollTop);
                setRndWidth(resizeWidth);
                setRndHeight(resizeHeight);
                dispatch(
                  updateBrowser({
                    browserId: id,
                    params: {
                      top: 10 + scrollTop,
                      left: 10,
                      width: resizeWidth,
                      height: resizeHeight,
                    },
                  })
                );
                dispatch(
                  setLastResizedBrowserDimensions([resizeWidth, resizeHeight])
                );
              }
            });
          } else {
            setX(d.x);
            setY(d.y);
            dispatch(
              updateBrowser({
                browserId: id,
                params: {
                  top: d.y,
                  left: d.x,
                },
              })
            );
          }
          break;
      }
      enablePointerEventsForAll();
      setScrollY(null);
    }
  };

  const onResizeStop = (
    ref: { offsetWidth: number; offsetHeight: number },
    position: { x: number; y: number }
  ) => {
    setX(position.x);
    setY(position.y);
    setRndWidth(ref.offsetWidth);
    setRndHeight(ref.offsetHeight);

    helpers.browser.requestCapture(id);
    enablePointerEventsForAll();

    dispatch(
      updateBrowser({
        browserId: id,
        params: {
          top: position.y,
          left: position.x,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        },
      })
    );
    dispatch(
      setLastResizedBrowserDimensions([ref.offsetWidth, ref.offsetHeight])
    );
  };

  const onResizeStart = () => {
    disablePointerEventsForAll();
  };

  const reload = () => {
    webviewRef.current?.reload();
    window.app.analytics.event('browser_reload');
  };

  const scrollListener = useCallback(() => {
    const timestamp = new Date().getTime();
    if (scrollY) window.scrollTo(0, scrollY);
    if (
      window.scrollY < top &&
      (window.scrollY + window.innerHeight > top + height ||
        window.innerHeight < height) &&
      timestamp - lastScreenshot > 5000 &&
      (!capture || capture === 'data:image/png;base64,')
    ) {
      helpers.browser.requestCapture(id);
      setLastScreenshot(timestamp);
    }
  }, [scrollY, height, top, helpers.browser, id, lastScreenshot, capture]);

  const makeBrowser = useMemo(() => {
    return (
      <motion.div
        className="Browser__container"
        ref={container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <BrowserTopBar
          closeBrowser={() => setTimeout(() => helpers.browser.close(id), 0)}
          minimizeBrowser={() => helpers.browser.minimize(id)}
          toggleFullSizeBrowser={toggleFullSizeBrowser}
          onClick={() => focus(id, true)}
          title={title}
          favicon={favicon}
          isLoading={isLoading}
          isMaximized={board.isFullSize}
        />
        <BrowserControlBar url={url} browserId={id} />
        <div className="Browser__webview-container">
          {permissionRequest && (
            <PermissionRequest
              url={permissionRequest?.url}
              permission={permissionRequest?.permission}
              browserId={id}
            />
          )}
          {isSearching && <SearchForm browserId={id} />}
          {certificateErrorFingerprint && webContentsId && (
            <CertificateErrorPage
              reload={reload}
              webContentsId={webContentsId}
              fingerprint={certificateErrorFingerprint}
              browserId={id}
            />
          )}
          <webview
            // @ts-ignore
            allowpopups="true"
            src={hasBeenActive || !board.isFullSize ? renderedUrl : undefined}
            partition="persist:user-partition"
            ref={webviewRef}
          />
        </div>
      </motion.div>
    );
  }, [
    board.isFullSize,
    certificateErrorFingerprint,
    favicon,
    focus,
    hasBeenActive,
    helpers.browser,
    id,
    isLoading,
    isSearching,
    renderedUrl,
    title,
    toggleFullSizeBrowser,
    url,
    webContentsId,
    permissionRequest,
  ]);

  useEffect(() => {
    if (id === board.activeBrowser || !board.isFullSize) setHasBeenActive(true);
  }, [board.activeBrowser, id, board.isFullSize]);

  useEffect(() => {
    if (firstRenderingState) {
      setFirstRenderingState(false);
      setRenderedUrl(url);
    }
  }, [firstRenderingState, url]);

  useEffect(() => {
    bringBrowserToTheFront(id);
  }, [id, bringBrowserToTheFront]);

  useEffect(() => {
    window.app.analytics.event('browser_navigate');
    window.app.config.get('browsing.dontSaveHistory').then((val: unknown) => {
      const typedVal = val as boolean | undefined;
      if (!typedVal)
        window.app.history
          .addHistory({ url, title: title || '' })
          .catch(console.log);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    const maxWidth = boardContainer?.clientWidth;
    const margin = 5;
    if (maxWidth) {
      const diff = left + width + margin - maxWidth;
      if (diff > 0) {
        if (width - diff > 300) {
          dispatch(
            updateBrowser({
              browserId: id,
              params: {
                width: width - diff,
              },
            })
          );
          setRndWidth(width - diff);
          setX(left);
        } else {
          dispatch(
            updateBrowser({
              browserId: id,
              params: {
                left: left - diff,
              },
            })
          );
          setX(left - diff);
          setRndWidth(width);
        }
      } else {
        setX(left);
        setY(top);
      }
    }
  }, [left, top, width, height, boardContainer, dispatch, id]);

  useEffect(() => {
    window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  }, [scrollListener]);

  useEffect(() => {
    if (browserIndex) helpers.board.distributeWindowsByOrder(board.browsers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Rnd
      style={{ display: 'flex' }}
      default={{
        x: left,
        y: top,
        width,
        height,
      }}
      position={{
        x,
        y,
      }}
      size={{
        width: rndWidth,
        height: rndHeight,
      }}
      dragHandleClassName="BrowserTopBar__container"
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      onDrag={onDrag}
      onResizeStop={(_e, _dir, ref, _delta, pos) => onResizeStop(ref, pos)}
      onResizeStart={onResizeStart}
      bounds="#Board__container"
      id={`Browser__${id}`}
      className={clsx({
        'Browser__is-full-size': board.isFullSize && !firstRenderingState,
        'Browser__is-minimized': isMinimized,
        'Browser__display-none': board.isFullSize && id !== board.activeBrowser,
        'Browser__draggable-container': true,
      })}
      disableDragging={board.isFullSize}
      enableResizing={board.isFullSize ? {} : undefined}
      data-testid="browser-window"
      data-id={id}
      ref={rndRef}
    >
      {makeBrowser}
    </Rnd>
  );
};
