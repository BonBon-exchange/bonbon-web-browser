import { configureStore, Store } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  createMigrate,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  Persistor,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import boardReducer from './reducers/Board';
import downloadsReducer from './reducers/Downloads';
import chatReducer from './reducers/Chat';
import { migrations } from './migrations';

export const store: Store = configureStore({
  reducer: {
    board: boardReducer,
    downloads: downloadsReducer,
    chat: chatReducer
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const getPersistedStoreAndPersistor = (
  id: string
): { persistor: Persistor; store: Store } => {
  const persistConfig = {
    key: id,
    version: 3,
    storage,
    migrate: createMigrate(migrations, { debug: true }),
  };
  const persistedBoard = persistReducer(persistConfig, boardReducer);
  const persistedDownloads = persistReducer(persistConfig, downloadsReducer);
  const persistedChat = persistReducer(persistConfig, chatReducer);
  const persistedStore = configureStore({
    reducer: {
      board: persistedBoard,
      downloads: persistedDownloads,
      chat: persistedChat
    },
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
  const persistor = persistStore(persistedStore);

  return { persistor, store: persistedStore };
};
