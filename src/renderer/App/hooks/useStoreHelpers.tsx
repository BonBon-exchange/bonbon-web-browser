/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-plusplus */
/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
import { useCallback, useMemo } from 'react';
import { v4 } from 'uuid';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from 'renderer/App/store/hooks';

import {
  addBrowser,
  setBoard,
  removeBrowser,
  minimizeBrowser,
  unminimizeBrowser,
  removeLastClosedUrl,
  toggleSearch,
  updateBrowser,
} from 'renderer/App/store/reducers/Board';
import { getCoordinateWithNoCollision } from 'renderer/App/helpers/d2';
import { BrowserProps } from 'renderer/App/components/Browser/Types';
import { useBoard } from './useBoard';
import { useBrowserMethods } from './useBrowserMethods';

const DEFAULT_HEIGHT = 800;
const DEFAULT_WIDTH = 600;

export const useStoreHelpers = (helpersParams?: { boardId?: string }) => {
  const dispatch = useAppDispatch();
  const board = useBoard();
  const { focus, focusUrlBar, next } = useBrowserMethods();
  const { t } = useTranslation();

  const boardContainer = document.getElementById('#Board__container');

  const makeBrowser = useCallback(
    async (params: {
      url?: string;
      top?: number;
      left?: number;
      browserIndex?: number;
    }): Promise<BrowserProps> => {
      const browserId = v4();
      const defaultWebpage = (await window.app.config.get(
        'browsing.defaultWebpage'
      )) as string;
      const defaultSize = (await window.app.config.get(
        'browsing.size'
      )) as string;
      const defaultWidth = (await window.app.config.get(
        'browsing.width'
      )) as number;
      const defaultHeight = (await window.app.config.get(
        'browsing.height'
      )) as number;

      let width;
      let height;

      switch (defaultSize) {
        default:
        case 'defined':
          width = defaultWidth;
          height = defaultHeight;
          break;

        case 'lastClosed':
          width = board.lastClosedBrowserDimensions
            ? board.lastClosedBrowserDimensions[0]
            : defaultWidth;
          height = board.lastClosedBrowserDimensions
            ? board.lastClosedBrowserDimensions[1]
            : defaultHeight;
          break;

        case 'lastResized':
          width = board.lastResizedBrowserDimensions
            ? board.lastResizedBrowserDimensions[0]
            : defaultWidth;
          height = board.lastResizedBrowserDimensions
            ? board.lastResizedBrowserDimensions[1]
            : defaultHeight;
          break;
      }

      if (boardContainer)
        width = Math.min(boardContainer?.clientWidth - 20, width);

      height = height || DEFAULT_HEIGHT;
      width = width || DEFAULT_WIDTH;

      const { x, y } = getCoordinateWithNoCollision(
        document,
        board,
        height,
        width
      );

      let { browserIndex } = params;
      if (!browserIndex) {
        if (params.url) {
          const activeBoardPosition = board.browsers.findIndex(
            (b) => b.id === board.activeBrowser
          );
          browserIndex = activeBoardPosition + 1;
        }
      }

      const newBrowser = {
        id: browserId,
        url: params.url || defaultWebpage,
        top: params.top || y,
        left: params.left || x,
        height,
        width,
        firstRendering: true,
        isLoading: true,
        isMinimized: false,
        browserIndex,
      };
      return newBrowser;
    },
    [board, boardContainer]
  );

  const createBoard = useCallback(
    async (params: { id?: string }) => {
      const newBrowser = await makeBrowser({});
      const id = params.id || v4();
      const newBoard = {
        id,
        label: t('New collection'),
        browsers: [newBrowser],
        closedUrls: [],
        isFullSize: false,
        browsersActivity: [],
        height: 0,
      };

      dispatch(setBoard(newBoard));
      window.app.analytics.event('add_board');
    },
    [dispatch, makeBrowser, t]
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

  const minBrowser = useCallback(
    (browserId: string) => {
      dispatch(minimizeBrowser(browserId));
      setTimeout(() => {
        if (next) focus(next);
      }, 0);
    },
    [dispatch, focus, next]
  );

  const showBrowser = useCallback(
    (browserId: string) => {
      dispatch(unminimizeBrowser(browserId));
    },
    [dispatch]
  );

  const closeBoard = useCallback(() => {
    window.app.board.close();
  }, []);

  const togSearch = useCallback(
    (browserId: string) => {
      dispatch(toggleSearch(browserId));
    },
    [dispatch]
  );

  const makeSortedContainers = useMemo(() => {
    const containers = document.querySelectorAll(
      '.Browser__draggable-container'
    );

    const sortedContainer = Array.from(containers).sort((a, b) => {
      const browserA = board.browsers.find(
        (brow) => brow.id === a.getAttribute('data-id')
      );
      const browserB = board.browsers.find(
        (brow) => brow.id === b.getAttribute('data-id')
      );

      if (browserA && browserB) {
        if (browserA.top - browserB.top > 1) return 1;
        if (browserA.top === browserB.top && browserA.left - browserB.left > 1)
          return 1;
      }

      return -1;
    });

    return sortedContainer;
  }, [board.browsers]);

  const distributeWindowsEvenly = useCallback(
    (sortedContainers: Element[]): Promise<void> => {
      return new Promise((resolve) => {
        const maxWidth =
          document.querySelector('#Board__container')?.clientWidth;
        let sumWidth = 0;
        let index = -1;
        const maxIndex = sortedContainers.length - 1;
        let rowContainers;
        let container;
        const yMargin = 10;
        let currentY = yMargin;
        let xMargin: number;
        let biggestHeight;
        let currentX: number;
        let id;
        if (maxWidth) {
          while (index < maxIndex) {
            rowContainers = [];
            sumWidth = 0;
            biggestHeight = 0;
            while (sumWidth <= maxWidth && index < maxIndex) {
              index++;
              container = sortedContainers[index];
              sumWidth += container.clientWidth;
              if (
                sumWidth < maxWidth ||
                (container.clientWidth >= maxWidth &&
                  rowContainers.length === 0)
              ) {
                if (container.clientHeight > biggestHeight)
                  biggestHeight = container.clientHeight;
                rowContainers.push(container);
              } else index--;
            }

            let rcSumWidth = 0;
            rowContainers.forEach((c) => {
              rcSumWidth += c.clientWidth;
            });

            xMargin = Math.max(
              10,
              Number(
                ((maxWidth - rcSumWidth) / (rowContainers.length + 1)).toFixed(
                  0
                )
              )
            );

            // process here
            currentX = xMargin;
            rowContainers.forEach((c, i) => {
              id = c.getAttribute('data-id');
              if (id) {
                dispatch(
                  updateBrowser({
                    browserId: id,
                    params: {
                      left: currentX,
                      top: currentY,
                      width: Math.min(maxWidth - 20, c.clientWidth),
                    },
                  })
                );
              }
              currentX += c.clientWidth + xMargin;
              if (i === rowContainers.length - 1) resolve();
            });

            // end
            currentY += yMargin + biggestHeight;
          }
        }
      });
    },
    [dispatch]
  );

  const distributeWindowsByOrder = useCallback(
    (newOrder: BrowserProps[]) => {
      return new Promise((resolve, reject) => {
        const sortedIds = newOrder.map((b) => b.id);
        const containers = document.querySelectorAll(
          '.Browser__draggable-container'
        );
        const sortedContainers = sortedIds
          .map((id) =>
            Array.from(containers).find((c) => c.getAttribute('data-id') === id)
          )
          .filter((e) => e !== undefined);
        if (sortedContainers && !board.isFullSize)
          distributeWindowsEvenly(sortedContainers as Element[])
            .then(resolve)
            .catch(reject);
      });
    },
    [board.isFullSize, distributeWindowsEvenly]
  );

  const distributeWindowsEvenlyDefault = useCallback(() => {
    const sortedContainers = makeSortedContainers;
    distributeWindowsEvenly(sortedContainers);
  }, [distributeWindowsEvenly, makeSortedContainers]);

  const getSortedBrowsers = useMemo(() => {
    const sortedContainers = makeSortedContainers;
    const sortedBrowsers = sortedContainers
      .map((s) => {
        const id = s.getAttribute('data-id');
        const brow = board.browsers.find((b) => b.id === id);
        return brow;
      })
      .filter((b) => b !== undefined);
    return sortedBrowsers as BrowserProps[];
  }, [board.browsers, makeSortedContainers]);

  const requestCapture = (browserId: string) => {
    const browser = board.browsers.find((b) => b.id === browserId);
    const wcId = browser?.webContentsId;
    if (wcId) {
      window.app.browser
        .requestCapture(wcId)
        .then((capture) => {
          dispatch(
            updateBrowser({
              browserId,
              params: {
                capture,
              },
            })
          );
        })
        .catch(console.log);
    }
  };

  const makeAndAddBrowser = useCallback(
    async (params: { url?: string }): Promise<void> => {
      if (board) {
        const newBrowser = await makeBrowser(params);

        dispatch(addBrowser(newBrowser));
        setTimeout(() => {
          focus(newBrowser.id);
          focusUrlBar(newBrowser.id);
        }, 300);
      }
    },
    [board, dispatch, makeBrowser, focus, focusUrlBar]
  );

  const reopenLastClosed = useCallback(() => {
    if (board.closedUrls.length > 0) {
      makeAndAddBrowser({ url: board.closedUrls[board.closedUrls.length - 1] });
      dispatch(removeLastClosedUrl());
    }
  }, [board.closedUrls, dispatch, makeAndAddBrowser]);

  return {
    browser: {
      add: makeAndAddBrowser,
      close: closeBrowser,
      reopenLastClosed,
      minimize: minBrowser,
      show: showBrowser,
      toggleSearch: togSearch,
      requestCapture,
    },
    board: {
      create: createBoard,
      load: loadBoard,
      close: closeBoard,
      distributeWindowsEvenly,
      distributeWindowsEvenlyDefault,
      getSortedBrowsers,
      distributeWindowsByOrder,
    },
  };
};
