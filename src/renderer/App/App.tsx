/* eslint-disable import/prefer-default-export */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { IpcRendererEvent } from 'electron';

import { store, getPersistedStoreAndPersistor } from 'renderer/App/store/store';
import { Addaps } from 'renderer/App/components/Addaps';
import ChatBar from 'renderer/App/components/ChatBar/ChatBar';
// import { ensureExpectedType } from '-lola/sepyt/utils';

import './i18n';

import 'renderer/App/style/dark.css';
import 'renderer/App/style/light.css';
import './App.css';
import { ChatState } from 'types/chat';
import ChatViews from './components/ChatViews/ChatViews';

export const App = (props: { chatState: ChatState }) => {
  const [isLoadedBoard, setIsLoadedBoard] = useState<boolean | string>(false);
  const [boardId, setBoardId] = useState<string>('');
  const [isChatActive, setIsChatActive] = useState<boolean>(false);
  const [tempChatState, setTempChatState] = useState<ChatState>(
    props.chatState
  );
  const persisted = useRef<any>(null);

  const loadBoardAction = useCallback(
    (_e: IpcRendererEvent, args: { boardId: string }) => {
      if (args.boardId === boardId) return;
      persisted.current = getPersistedStoreAndPersistor(args.boardId);
      setBoardId(args.boardId);
      setIsLoadedBoard(true);
    },
    [boardId, persisted, setBoardId]
  );

  const purgeAction = useCallback(() => {
    if (persisted.current?.persistor) {
      persisted.current?.persistor.purge();
      localStorage.removeItem(`persist:${boardId}`);
    }
  }, [boardId, persisted]);

  const handleInitChat = useCallback(() => {
    setIsChatActive(true);
  }, [setIsChatActive]);

  const handleEndChat = useCallback(() => {
    setIsChatActive(false);
    setTempChatState({
      username: '',
      isMagic: false,
    });
  }, [setIsChatActive, setTempChatState]);

  useEffect(() => {
    window.app.listener.loadBoard(loadBoardAction);
    return () => window.app.off.loadBoard();
  }, [loadBoardAction]);

  useEffect(() => {
    window.app.listener.purge(purgeAction);
    return () => window.app.off.purge();
  }, [purgeAction]);

  useEffect(() => {
    window.app.analytics.event('load_app');
  }, []);

  useEffect(() => {
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const target = e.target as HTMLDivElement;

      if (
        document
          .getElementById('LeftBar__browserFavContainerItems')
          ?.contains(target)
      )
        window.app.tools.showLeftbarContextMenu({ x: e.clientX, y: e.clientY });
    });
  }, []);

  useEffect(() => {
    window.app.listener.initChat(handleInitChat);
    return () => window.app.off.initChat();
  }, [handleInitChat]);

  useEffect(() => {
    window.app.listener.endChat(handleEndChat);
    return () => window.app.off.endChat();
  }, [handleEndChat]);

  useEffect(() => {
    localStorage.getItem('isChatActive') === 'true'
      ? setIsChatActive(true)
      : setIsChatActive(false);

    try {
      const lsstate = localStorage.getItem('chat');
      if (lsstate && lsstate.length > 2) {
        const state = JSON.parse(lsstate) as ChatState;
        setTempChatState(state);
        localStorage.setItem('chat', '');
      } else { /* empty */ }
    } catch (e) {
      console.log({ e });
    }
  }, []);

  return isLoadedBoard ? (
    <Provider store={persisted.current?.store}>
      <PersistGate loading={null} persistor={persisted.current?.persistor}>
        <Addaps boardId={boardId} chatState={props.chatState}/>
        {isChatActive && (
          <>
            <ChatViews />
            <ChatBar
              isMagic={tempChatState.isMagic}
              username={tempChatState.username}
              setTempChatState={setTempChatState}
            />
          </>
        )}
      </PersistGate>
    </Provider>
  ) : (
    <Provider store={store}>
      <Addaps/>
    </Provider>
  );
};
