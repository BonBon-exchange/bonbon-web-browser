/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
import { useCallback } from 'react';
import { v4 } from 'uuid';

import { useAppDispatch } from 'renderer/App/store/hooks';

import {
  addBrowser,
  setBoard,
  removeBrowser,
  removeLastCloseUrl,
} from 'renderer/App/store/reducers/Board';
import { getCoordinateWithNoCollision } from 'renderer/App/helpers/d2';
import { useBoard } from './useBoard';
import { useBrowserMethods } from './useBrowserMethods';

export const useStoreHelpers = (helpersParams?: { boardId?: string }) => {
  const dispatch = useAppDispatch();
  const board = useBoard();
  const { scrollToBrowser, focusUrlBar } = useBrowserMethods();

  const makeBrowser = useCallback(
    async (params: { url?: string; top?: number; left?: number }) => {
      const browserId = v4();
      const { x, y } = getCoordinateWithNoCollision(document, board, 800, 600);
      const defaultWebpage = (await window.app.store.get(
        'defaultWebpage'
      )) as string;
      const newBrowser = {
        id: browserId,
        url: params.url || defaultWebpage,
        top: params.top || y,
        left: params.left || x,
        height: 800,
        width: 600,
        firstRendering: true,
        isLoading: true,
      };
      return newBrowser;
    },
    [board]
  );

  const makeAndAddBrowser = useCallback(
    async (params: { url?: string }): Promise<void> => {
      if (board) {
        const newBrowser = await makeBrowser(params);
        dispatch(addBrowser(newBrowser));
        setTimeout(() => {
          scrollToBrowser(document, newBrowser.id);
          focusUrlBar(document, newBrowser.id);
        }, 300);
      }
    },
    [board, dispatch, makeBrowser, scrollToBrowser, focusUrlBar]
  );

  const createBoard = useCallback(
    async (params: { id?: string }) => {
      const newBrowser = await makeBrowser({ top: 120, left: 120 });
      const id = params.id || v4();
      const newBoard = {
        id,
        label: `New board`,
        browsers: [newBrowser],
        closedUrls: [],
        isFullSize: false,
      };

      dispatch(setBoard(newBoard));
      window.app.analytics.event('add_board');
    },
    [dispatch, makeBrowser]
  );

  const loadBoard = useCallback(
    (params: { id: string }) => {
      window.app.analytics.event('load_board');
      if (board.id === helpersParams?.boardId) return;
      createBoard(params);
    },
    [createBoard, board.id, helpersParams?.boardId]
  );

  const closeBrowser = useCallback(
    (browserId: string) => {
      dispatch(removeBrowser(browserId));
    },
    [dispatch]
  );

  const closeBoard = useCallback(() => {
    window.app.board.close();
  }, []);

  const reopenLastClosed = useCallback(() => {
    if (board.closedUrls.length > 0) {
      makeAndAddBrowser({ url: board.closedUrls[board.closedUrls.length - 1] });
      dispatch(removeLastCloseUrl());
    }
  }, [board.closedUrls, dispatch, makeAndAddBrowser]);

  return {
    browser: {
      add: makeAndAddBrowser,
      close: closeBrowser,
      reopenLastClosed,
    },
    board: {
      create: createBoard,
      load: loadBoard,
      close: closeBoard,
    },
  };
};
