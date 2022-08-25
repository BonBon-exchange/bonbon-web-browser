/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 } from 'uuid';

import { WritableDraft } from 'immer/dist/internal';
import { BoardType } from 'renderer/App/components/Board/Types';
import { BrowserProps } from 'renderer/App/components/Browser/Types';

type UpdateBrowserType = {
  browserId: string;
  params: Partial<BrowserProps>;
};

type UpdateBrowserUrlType = {
  url: string;
  browserId: string;
};

type UpdateBrowserLoadingType = {
  isLoading: boolean;
  browserId: string;
};

type UpdateBrowserTitleType = {
  title: string;
  browserId: string;
};

type UpdateBrowserFavType = {
  favicon: string;
  browserId: string;
};

type UpdateBrowserCertificateFingerprintType = {
  certificateErrorFingerprint: string | null;
  browserId: string;
};

interface BoardState {
  board: BoardType;
}

const boardId = v4();
const newBoard = {
  id: boardId,
  label: 'New collection',
  browsers: [],
  activeBrowser: null,
  closedUrls: [],
  isFullSize: false,
  browsersActivity: [],
  height: 0,
};

export const initialState: BoardState = {
  board: newBoard,
};

const addCLosedUrl = (state: WritableDraft<BoardState>, url: string) => {
  if (state.board.closedUrls.length > 20) {
    state.board.closedUrls.splice(0, 1);
  }
  state.board.closedUrls.push(url);
};

const addBrowserActivity = (
  state: WritableDraft<BoardState>,
  browserId: string
) => {
  if (state.board.browsersActivity.length > 20) {
    state.board.browsersActivity.splice(0, 1);
  }
  state.board.browsersActivity = state.board.browsersActivity.filter(
    (b) => b !== browserId
  );
  state.board.browsersActivity.push(browserId);
};

const findAndSelectTabForExtensionsFromBrowserId = (
  state: WritableDraft<BoardState>,
  browserId: string
): void => {
  const wcId = state.board.browsers.find(
    (b) => b.id === browserId
  )?.webContentsId;
  if (wcId) window.app.browser.select(wcId);
};

const setStateActiveBrowser = (
  state: WritableDraft<BoardState>,
  browserId: string
): void => {
  state.board.activeBrowser = browserId;
  addBrowserActivity(state, browserId);
  findAndSelectTabForExtensionsFromBrowserId(state, browserId);
};

const getBrowserIndexFromBrowserId = (
  state: WritableDraft<BoardState>,
  browserId: string
): number => {
  return state.board.browsers.findIndex((b) => b.id === browserId);
};

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setBoard: (state, action: PayloadAction<BoardType>) => {
      state.board = action.payload;
      const activeBrowser = state.board.browsers.find(
        (b) => b.id === state.board.activeBrowser
      );
      if (!state.board.activeBrowser || !activeBrowser) {
        if (state.board.browsers.length > 0) {
          setStateActiveBrowser(
            state,
            state.board.browsers[state.board.browsers.length - 1].id
          );
        }
      }
      if (state.board.activeBrowser) {
        findAndSelectTabForExtensionsFromBrowserId(
          state,
          state.board.activeBrowser
        );
      }
    },
    toggleBoardFullSize: (state) => {
      state.board.isFullSize = !state.board.isFullSize;
      window.app.analytics.event(`toggle_fullsize_${!state.board.isFullSize}`);
    },
    setActiveBrowser: (state, action: PayloadAction<string>) => {
      setStateActiveBrowser(state, action.payload);
    },
    addBrowser: (state, action: PayloadAction<BrowserProps>) => {
      if (action.payload.browserIndex) {
        state.board.browsers.splice(
          action.payload.browserIndex,
          0,
          action.payload
        );
      } else {
        state.board.browsers.push(action.payload);
      }
      setStateActiveBrowser(state, action.payload.id);
      window.app.analytics.event('add_browser');
    },
    setBrowsers: (state, action: PayloadAction<BrowserProps[]>) => {
      state.board.browsers = action.payload;
    },
    updateBrowser: (state, action: PayloadAction<UpdateBrowserType>) => {
      const browserIndex = getBrowserIndexFromBrowserId(
        state,
        action.payload.browserId
      );
      if (browserIndex > -1) {
        state.board.browsers[browserIndex] = {
          ...state.board.browsers[browserIndex],
          ...action.payload.params,
        };
      }
    },
    updateBrowserUrl: (state, action: PayloadAction<UpdateBrowserUrlType>) => {
      const browserIndex = getBrowserIndexFromBrowserId(
        state,
        action.payload.browserId
      );
      if (browserIndex > -1) {
        state.board.browsers[browserIndex].url = action.payload.url;
      }
    },
    updateBrowserLoading: (
      state,
      action: PayloadAction<UpdateBrowserLoadingType>
    ) => {
      const browserIndex = getBrowserIndexFromBrowserId(
        state,
        action.payload.browserId
      );
      if (browserIndex > -1) {
        state.board.browsers[browserIndex].isLoading = action.payload.isLoading;
      }
    },
    updateBrowserTitle: (
      state,
      action: PayloadAction<UpdateBrowserTitleType>
    ) => {
      const browserIndex = getBrowserIndexFromBrowserId(
        state,
        action.payload.browserId
      );
      if (browserIndex > -1) {
        state.board.browsers[browserIndex].title = action.payload.title;
      }
    },
    updateBrowserFav: (state, action: PayloadAction<UpdateBrowserFavType>) => {
      const browserIndex = getBrowserIndexFromBrowserId(
        state,
        action.payload.browserId
      );
      if (browserIndex > -1) {
        state.board.browsers[browserIndex].favicon = action.payload.favicon;
      }
    },
    renameBoard: (state, action: PayloadAction<string>) => {
      state.board.label = action.payload;
      window.app.analytics.event('rename_board');
    },
    minimizeBrowser: (state, action: PayloadAction<string>) => {
      const browserIndex = getBrowserIndexFromBrowserId(state, action.payload);
      state.board.browsers[browserIndex].isMinimized = true;
    },
    unminimizeBrowser: (state, action: PayloadAction<string>) => {
      const browserIndex = getBrowserIndexFromBrowserId(state, action.payload);

      state.board.browsers[browserIndex].isMinimized = false;
    },
    removeBrowser: (state, action: PayloadAction<string>) => {
      const browserIndex = getBrowserIndexFromBrowserId(state, action.payload);

      // remove browser from state
      if (browserIndex > -1) {
        if (!state.board.closedUrls) state.board.closedUrls = [];
        addCLosedUrl(state, state.board.browsers[browserIndex].url);
        state.board.lastClosedBrowserDimensions = [
          state.board.browsers[browserIndex].width,
          state.board.browsers[browserIndex].height,
        ];
        state.board.browsers.splice(browserIndex, 1);

        // clean browsersActivity state
        state.board.browsersActivity = state.board.browsersActivity.filter(
          (b) => b !== action.payload
        );
      }

      // clean activeBrowser
      if (state.board.activeBrowser === action.payload) {
        if (state.board.browsers.length > 0) {
          setStateActiveBrowser(
            state,
            state.board.browsersActivity[
              state.board.browsersActivity.length - 1
            ]
          );
        } else {
          state.board.activeBrowser = null;
          window.app.browser.selectBrowserView();
        }
      }

      window.app.analytics.event('close_browser');
    },
    removeAllBrowsersExcept: (state, action: PayloadAction<string>) => {
      state.board.browsers
        .filter((b) => b.id !== action.payload)
        .forEach((b) => addCLosedUrl(state, b.url));

      state.board.browsers = state.board.browsers.filter(
        (b) => b.id === action.payload
      );

      // clean activeBrowser
      setStateActiveBrowser(state, action.payload);

      // clean browsersActivity state
      state.board.browsersActivity = state.board.browsersActivity.filter(
        (b) => b === action.payload
      );

      // send event
      window.app.analytics.event('close_others_browser');
    },
    updateBrowserCertificateErrorFingerprint: (
      state,
      action: PayloadAction<UpdateBrowserCertificateFingerprintType>
    ) => {
      const browserIndex = getBrowserIndexFromBrowserId(
        state,
        action.payload.browserId
      );
      if (browserIndex > -1) {
        state.board.browsers[browserIndex].certificateErrorFingerprint =
          action.payload.certificateErrorFingerprint;
      }
    },
    removeAllBrowsers: (state) => {
      if (!state.board.closedUrls) state.board.closedUrls = [];
      state.board.browsers.forEach((b) => addCLosedUrl(state, b.url));
      state.board.browsers = [];
      state.board.browsersActivity = [];
      state.board.activeBrowser = null;
      window.app.browser.selectBrowserView();
      window.app.analytics.event('close_all_browsers');
    },
    removeLastClosedUrl: (state) => {
      state.board.closedUrls.splice(state.board.closedUrls.length - 1, 1);
    },
    toggleSearch: (state, action: PayloadAction<string>) => {
      const browserIndex = getBrowserIndexFromBrowserId(state, action.payload);
      state.board.browsers[browserIndex].isSearching =
        !state.board.browsers[browserIndex].isSearching;
    },
    setLastResizedBrowserDimensions: (
      state,
      action: PayloadAction<[number, number]>
    ) => {
      state.board.lastResizedBrowserDimensions = action.payload;
    },
    setBoardHeight: (state, action: PayloadAction<number>) => {
      state.board.height = action.payload;
    },
  },
});

export const {
  setBoard,
  updateBrowserUrl,
  updateBrowserFav,
  renameBoard,
  removeBrowser,
  minimizeBrowser,
  unminimizeBrowser,
  removeAllBrowsers,
  addBrowser,
  setActiveBrowser,
  updateBrowserTitle,
  updateBrowser,
  toggleBoardFullSize,
  removeLastClosedUrl,
  setBrowsers,
  removeAllBrowsersExcept,
  updateBrowserLoading,
  updateBrowserCertificateErrorFingerprint,
  toggleSearch,
  setLastResizedBrowserDimensions,
  setBoardHeight,
} = boardSlice.actions;

export default boardSlice.reducer;
