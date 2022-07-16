/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
import React, { ReactEventHandler, useEffect, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { Reorder } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import clsx from 'clsx';

import { useBoard } from 'renderer/App/hooks/useBoard';
import { BrowserProps } from 'renderer/App/components/Browser/Types';
import { useBrowserMethods } from 'renderer/App/hooks/useBrowserMethods';
import { useAppDispatch } from 'renderer/App/store/hooks';
import { setBrowsers } from 'renderer/App/store/reducers/Board';
import { ButtonAddBrowser } from 'renderer/App/components/ButtonAddBrowser';
import { useStoreHelpers } from 'renderer/App/hooks/useStoreHelpers';

import loadingImg from 'renderer/App/svg/loading.svg';
import icon from './icon.png';

import './style.scss';

export const LeftBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const board = useBoard();
  const { focus } = useBrowserMethods();
  const [items, setItems] = useState<BrowserProps[]>(board.browsers);
  const { browser } = useStoreHelpers();

  const handleReorder = (newOrder: BrowserProps[]) => {
    dispatch(setBrowsers(newOrder));
  };

  const handleImageError: ReactEventHandler<HTMLImageElement> = (e) => {
    const target = e.target as HTMLImageElement;
    target.src = icon;
  };

  const handleClickFavicon = (browserId: string) => {
    browser.show(browserId);
    setTimeout(() => {
      focus(document, browserId);
    }, 0);
  };

  useEffect(() => {
    setItems(board.browsers);
  }, [board.browsers]);

  return (
    <div id="LeftBar__browserFavContainer">
      <Reorder.Group values={items} onReorder={handleReorder}>
        <div id="LeftBar__browserFavContainerItems">
          {items.map((b: BrowserProps) => {
            return (
              <Reorder.Item key={b.id} value={b}>
                <Tooltip title={b.title || ''} placement="right" key={b.id}>
                  <div className="LeftBar__browserContainer">
                    <div
                      className="LeftBar__closeBrowser"
                      onClick={() => browser.close(b.id)}
                    >
                      <CloseIcon />
                    </div>
                    <div
                      className={clsx({
                        selected: b.id === board.activeBrowser,
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
          })}
        </div>
        <ButtonAddBrowser onClick={browser.add} />
      </Reorder.Group>
    </div>
  );
};
