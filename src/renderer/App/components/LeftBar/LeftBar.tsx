/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
import { ReactEventHandler, useCallback, useEffect, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { Reorder } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import clsx from 'clsx';

import { ChatRunner } from 'types/chat';
import { useBoard } from 'renderer/App/hooks/useBoard';
import { BrowserProps } from 'renderer/App/components/Browser/Types';
import { useBrowserMethods } from 'renderer/App/hooks/useBrowserMethods';
import { useAppDispatch } from 'renderer/App/store/hooks';
import { setBrowsers } from 'renderer/App/store/reducers/Board';
import { ButtonAddBrowser } from 'renderer/App/components/ButtonAddBrowser';
import { useStoreHelpers } from 'renderer/App/hooks/useStoreHelpers';
import { useChat } from 'renderer/App/hooks/useChat';

import loadingImg from 'renderer/App/svg/loading.svg';
import icon from './icon.png';

import './style.scss';

export const LeftBar = () => {
  const chat = useChat()
  const dispatch = useAppDispatch();
  const boardState = useBoard();
  const { focus } = useBrowserMethods();
  const [items, setItems] = useState<BrowserProps[]>(boardState.browsers);
  const [chatItems, setChatItems] = useState<ChatRunner[]>(Object.keys(chat?.runners ?? {}).map(runnerId => chat?.runners?.[runnerId] as ChatRunner) ?? []);
  const { browser, board } = useStoreHelpers();

  const handleReorder = (newOrder: BrowserProps[]) => {
    setItems(newOrder);
    dispatch(setBrowsers(newOrder));
    board.distributeWindowsByOrder(newOrder);
  };

  const handleReorderChatItems = (newOrder: ChatRunner[]) => {
    setChatItems(newOrder);
  };

  const handleImageError: ReactEventHandler<HTMLImageElement> = (e) => {
    const target = e.target as HTMLImageElement;
    target.src = icon;
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

  const makeItem = useCallback(
    (b: BrowserProps) => {
      return (
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
      );
    },
    [boardState.activeBrowser, browser, handleClickFavicon]
  );

  const makeChatItem = useCallback((runnerId: string) => {
    const runner = chat?.runners?.[runnerId]
    return (
      <Reorder.Item key={`reorderChatItem-${runnerId}`} value={runnerId}>
        <Tooltip title={runner?.context.username} placement="right" key={runnerId}>
          <div className="LeftBar__chatItemContainer" onClick={() => window.app.chat.setVisibleRunner(runnerId)}>
            <div className="LeftBar__chatItem">
              {
                runner?.action === 'contact' && (runner.context.username.substring(0, 1).toUpperCase())
              }
            </div>
          </div>
        </Tooltip>
      </Reorder.Item>
    )
  }, [chat?.runners])

  const makeFavicons = useCallback(() => {
    return items.map((b: BrowserProps) => makeItem(b));
  }, [items, makeItem]);

  const makeChatItems = useCallback(() => {
    return Object.keys(chat?.runners ?? {}).map((runnerId) => makeChatItem(runnerId));
  }, [chat?.runners, makeChatItem]);

  const initChat = () => {
    window.app.chat.init()
  }

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

  return (
    <>
      <div id="LeftBar__browserFavContainer">
        <Reorder.Group values={items} onReorder={handleReorder} axis="y">
          <div id="LeftBar__browserFavContainerItems">{makeFavicons()}</div>
          <Tooltip title="Add a webview" placement="right">
          <ButtonAddBrowser onClick={browser.add} />
          </Tooltip>
        </Reorder.Group>
      </div>
      <div id='LeftBar__chatItems'>
        <Reorder.Group values={chatItems} onReorder={handleReorderChatItems} axis="y">
          {makeChatItems()}
        </Reorder.Group>
        <Tooltip title="Magic Chat" placement='right'>
          <div id="LeftBar__magicChat" className='LeftBar__chatItemContainer' onClick={initChat}>
            <div id="LeftBar__magicChat" className='LeftBar__chatItem'>@</div>
          </div>
        </Tooltip>
      </div>
    </>
  );
};
