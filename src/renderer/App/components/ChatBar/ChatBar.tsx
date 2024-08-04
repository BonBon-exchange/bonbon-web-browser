import clsx from 'clsx';

import './style.scss';
import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  KeyboardEventHandler,
  Dispatch,
  SetStateAction,
} from 'react';

import { ChatState } from '../../../../types/chat';

type ChatStateProps = ChatState & {
  setTempChatState: Dispatch<SetStateAction<ChatState>>;
};

export default (props: ChatStateProps) => {
  const chatBarRef = useRef<HTMLDivElement>(null);
  const magicInputRef = useRef<HTMLInputElement>(null);
  const inputContactMagicRef = useRef<HTMLInputElement>(null);
  const inputContactUsernameRef = useRef<HTMLInputElement>(null);
  const [isStateMessageReceived, setIsStateMessageReiceived] =
    useState<boolean>(false);
  const [shouldEnhighChatbar, setShouldEnhighChatbar] =
    useState<boolean>(false);
  const [username, setUsername] = useState<string>(props.username ?? '');
  const [inputUsername, setInputUsername] = useState<string>('');
  const [usernameHasBeenSet, setUsernameHasBeenSet] = useState<boolean>(
    Number(props?.username?.length) > 0
  );
  const [magic, setMagic] = useState<string>('');
  const [magicHasBeenSet, setMagicHasBeenSet] = useState<boolean>(
    props.isMagic ?? false
  );
  const [componentChatState, setComponentChatState] = useState<ChatState>({
    username: props.username,
    isMagic: props.isMagic,
  });
  const [chatView, setChatView] = useState<string>('');
  const [inputContactUsername, setInputContactUsername] = useState<string>('');
  const [inputContactMagic, setInputContactMagic] = useState<string>('');
  // const [shouldShowMagicEffect, setShouldShowMagicEffect] =
  //  useState<boolean>(false);

  const setContactView = () => {
    setChatView('contact')
    inputContactUsernameRef.current?.focus()
  }

  const contactRun = async () => {
    const runnerId = await window.app.chat.createRunner({
      action: 'contact',
      context: {
        username: inputContactUsername,
        magic: inputContactMagic,
      },
    });

    setInputContactUsername('')
    setInputContactMagic('')

    setChatView(`home`);
  };

  const contactMagicOnKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (
      e.key === 'Enter' &&
      inputContactMagic.length > 0 &&
      inputContactUsername.length > 0
    ) {
      contactRun();
    } else if (e.key === 'Enter' && inputContactMagic.length > 0) {
      inputContactUsernameRef.current?.focus();
    }
  };

  const contactUsernameOnKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (
      e.key === 'Enter' &&
      inputContactUsername.length > 0 &&
      inputContactMagic.length === 0
    ) {
      inputContactMagicRef.current?.focus();
    } else if (e.key === 'Enter' && inputContactUsername.length > 0) {
      contactRun();
    }
  };

  const userNameOnKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && inputUsername.length > 0) {
      window.app.chat.setUsername(inputUsername);
      setUsername(inputUsername);
      setInputUsername('');
      setUsernameHasBeenSet(true);
    }
  };

  const magicOnKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && magic.length > 0) {
      window.app.chat.setMagic(magic);
      setMagic('');
      setMagicHasBeenSet(true);
      // setShouldShowMagicEffect(true);
      setTimeout(() => {
        // setShouldShowMagicEffect(false);
      }, 400);
    }
  };

  const messageReceivedAction = useCallback(() => {
    setIsStateMessageReiceived(true);
    setTimeout(() => setIsStateMessageReiceived(false), 300);
  }, [setIsStateMessageReiceived]);

  const mouseMoveAction = useCallback((e: MouseEvent) => {
    const cb = chatBarRef.current?.getBoundingClientRect();
    const distance = Number(cb?.top) - e.clientY;
    distance < 100
      ? setShouldEnhighChatbar(true)
      : setShouldEnhighChatbar(false);
  }, []);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    callback: () => any
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      callback();
    }
  };

  useEffect(() => {
    window.app.listener.chatMessageReceived(messageReceivedAction);
    return () => {
      window.app.off.chatMessageReceived();
    };
  }, [messageReceivedAction]);

  useEffect(() => {
    window.addEventListener('mousemove', mouseMoveAction);
    return () => {
      window.removeEventListener('mousemove', mouseMoveAction);
    };
  }, [mouseMoveAction]);

  useEffect(() => {
    if (usernameHasBeenSet) magicInputRef.current?.focus();
  }, [usernameHasBeenSet, magicInputRef]);

  useEffect(() => {
    const currentState = componentChatState;
    currentState.username = username;
    currentState.isMagic = magicHasBeenSet;
    setComponentChatState(currentState);
  }, [
    username,
    magic,
    componentChatState,
    magicHasBeenSet,
    setComponentChatState,
  ]);

  useEffect(() => {
    const currentState = componentChatState;
    currentState.username = props.username;
    currentState.isMagic = props.isMagic;
    props.setTempChatState(componentChatState);
  }, [componentChatState, props]);

  useEffect(() => {
    setUsernameHasBeenSet(Number(props?.username?.length) > 0);
    setMagicHasBeenSet(props?.isMagic ?? false);
  }, [props, setUsernameHasBeenSet, setMagicHasBeenSet]);

  useEffect(() => {
    if (chatView === '' && usernameHasBeenSet && magicHasBeenSet) {
      setChatView('home');
      inputContactUsernameRef.current?.focus();
    }
  }, [
    usernameHasBeenSet,
    magicHasBeenSet,
    chatView,
    setChatView,
    inputContactUsernameRef,
  ]);

  return (
    <div
      id="chat-bar"
      ref={chatBarRef}
      className={clsx({
        'message-received': isStateMessageReceived,
        'user-is-close': shouldEnhighChatbar,
        // 'magic-effect': shouldShowMagicEffect,
      })}
    >
      {!usernameHasBeenSet && !(componentChatState.username?.length > 0) && (
        <input
          type="text"
          id="chat-bar-set-username"
          className={clsx({ hidden: !shouldEnhighChatbar }, 'chat-bar-register-input')}
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
          placeholder="username"
          onKeyDown={userNameOnKeyDown}
        />
      )}

      {!magicHasBeenSet &&
        usernameHasBeenSet &&
        !componentChatState.isMagic && (
          <input
            type="text"
            id="chat-bar-set-magic"
            ref={magicInputRef}
            className={clsx({ hidden: !shouldEnhighChatbar }, 'chat-bar-register-input')}
            value={magic}
            onChange={(e) => setMagic(e.target.value)}
            placeholder="magic"
            onKeyDown={magicOnKeyDown}
          />
        )}

      {chatView === 'home' && (
        <div id="chat-bar-home">
          <div
            className="chat-bar-home-item"
            onClick={() => setChatView('meet')}
            onKeyDown={(e) => handleKeyDown(e, () => setChatView('meet'))}
          >
            Meet
          </div>
          <div
            className="chat-bar-home-item"
            onClick={setContactView}
            onKeyDown={(e) => handleKeyDown(e, () => setContactView())}
          >
            Contact
          </div>
        </div>
      )}

      {chatView === 'contact' && (
        <div id="chat-bar-contact">
          <input
            type="text"
            id="chat-bar-contact-username"
            className="chat-bar-contact-input"
            ref={inputContactUsernameRef}
            value={inputContactUsername}
            onChange={(e) => setInputContactUsername(e.target.value)}
            placeholder="username"
            onKeyDown={contactUsernameOnKeyDown}
          />
          <input
            type="text"
            id="chat-bar-contact-magic"
            className="chat-bar-contact-input"
            ref={inputContactMagicRef}
            value={inputContactMagic}
            onChange={(e) => setInputContactMagic(e.target.value)}
            placeholder="magic"
            onKeyDown={contactMagicOnKeyDown}
          />
        </div>
      )}
    </div>
  );
};
