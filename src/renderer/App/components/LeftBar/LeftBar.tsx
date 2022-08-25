/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable promise/always-return */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
import React, {
  ReactEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Reorder } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import clsx from 'clsx';

import { useBoard } from 'renderer/App/hooks/useBoard';
import { BrowserProps } from 'renderer/App/components/Browser/Types';
import { useAppDispatch } from 'renderer/App/store/hooks';
import { setBrowsers } from 'renderer/App/store/reducers/Board';
import { ButtonAddBrowser } from 'renderer/App/components/ButtonAddBrowser';
import { useStoreHelpers } from 'renderer/App/hooks/useStoreHelpers';
import { useBrowserMethods } from 'renderer/App/hooks/useBrowserMethods';

import loadingImg from 'renderer/App/images/loading.svg';
import icon from 'renderer/App/images/icon.png';

import './style.scss';

const handleImageError: ReactEventHandler<HTMLImageElement> = (e) => {
  const target = e.target as HTMLImageElement;
  target.src = icon;
};

export const LeftBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const boardState = useBoard();
  const [items, setItems] = useState<BrowserProps[]>(boardState.browsers);
  const { browser, board } = useStoreHelpers();
  const { focus } = useBrowserMethods();

  const handleReorder = (newOrder: BrowserProps[]) => {
    setItems(newOrder);
    dispatch(setBrowsers(newOrder));
    board.distributeWindowsByOrder(newOrder);
  };

  const handleAddBrowser = () => {
    browser.add({}).catch(console.log);
  };

  const handleClickFavicon = useCallback(
    (browserId: string) => {
      browser.show(browserId);
      setTimeout(() => {
        focus(browserId);
      }, 0);
    },
    [focus, browser]
  );

  const memoLeftBarItem = useCallback(
    (b: BrowserProps) => (
      <Reorder.Item key={`reorderItem-${b.id}`} value={b}>
        <Tooltip title={b.title || ''} placement="right" key={b.id}>
          <div className="LeftBar__browserContainer">
            <div
              className={
                !b.isMinimized
                  ? 'LeftBar__closeBrowser'
                  : 'LeftBar__maximizeBrowser'
              }
              onClick={() => {
                if (!b.isMinimized) {
                  browser.close(b.id);
                }
              }}
            >
              {!b.isMinimized ? <CloseIcon /> : <OpenInFullIcon />}
            </div>
            <div
              className={clsx({
                selected: b.id === boardState.activeBrowser,
                LeftBar__browserFav: true,
              })}
              key={b.id}
              onClick={() => handleClickFavicon(b.id)}
              data-browserid={b.id}
            >
              <img
                src={b.isLoading ? loadingImg : b.favicon || icon}
                className="LeftBar__browserFavImg"
                onError={handleImageError}
              />
            </div>
          </div>
        </Tooltip>
      </Reorder.Item>
    ),
    [boardState.activeBrowser, browser, handleClickFavicon]
  );

  const makeItem = useCallback(
    (b: BrowserProps) => {
      return memoLeftBarItem(b);
    },
    [memoLeftBarItem]
  );

  const makeFavicons = useCallback(() => {
    return items.map((b: BrowserProps) => makeItem(b));
  }, [items, makeItem]);

  useEffect(() => {
    if (boardState.isFullSize) {
      setItems(boardState.browsers);
    }
  }, [boardState.isFullSize, boardState.browsers]);

  useEffect(() => {
    if (!boardState.isFullSize) {
      setItems(board.getSortedBrowsers);
    }
  }, [board.getSortedBrowsers, boardState.isFullSize]);

  useEffect(() => {
    const container = document.querySelector(
      '#LeftBar__browserFavContainerItems'
    );
    if (container) {
      setTimeout(() => {
        // TODO: handle new windows that open at a given position, we may not need to scroll
        container.scrollBy(0, container.scrollHeight);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardState.activeBrowser]);

  return (
    <div id="LeftBar__browserFavContainer">
      <Reorder.Group values={items} onReorder={handleReorder} axis="y">
        <div id="LeftBar__browserFavContainerItems">{makeFavicons()}</div>
        <ButtonAddBrowser onClick={handleAddBrowser} />
      </Reorder.Group>
    </div>
  );
};
