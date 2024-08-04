/* eslint-disable camelcase */
import { createRoot } from 'react-dom/client';

import { ChatState } from 'types/chat';
import { IpcRendererEvent } from 'electron';
import { Expected } from '-lola/sepyt/lola';
import ManagedMemoryProxy from '-lola/seludom/mm';
import { App } from './App';

(window as Expected)['----/__/0/CDXX/-'] = {
  ':.BonBon': {
    chat: { username: '', isMagic: false },
  },
} as Expected;

const bonbon_state: { chat: ChatState } = (window as Expected)[
  '----/__/0/CDXX/-'
][':.BonBon'];
['states'];

const bonboot = ({
  context,
}: {
  context: {
    states: {
      chat: ChatState;
    };
  };
}) => {
  try {
    bonbon_state.chat = context.states.chat;
    
    const container = document.getElementById('root')!;
    const root = createRoot(container);
    const handleChatState = (
      _e: IpcRendererEvent,
      args: {
        chatState: ChatState;
      }
    ) => {
      bonbon_state.chat = args.chatState;
      root.render(<App chatState={bonbon_state.chat} />);
    };

    window.app.listener.chatState(handleChatState);
    root.render(<App chatState={bonbon_state.chat} />);
  } catch (e) {
    window.app.off.chatState();
  }
};

const BonBonMMP = new ManagedMemoryProxy(() => ({
  bonboot: (bootArgs: Expected) => bonboot(bootArgs),
}));

console.log({ bonboot });

const bbproxy = BonBonMMP.getProxy();

(global as Expected).bonboot = bonboot;

console.log({ bbproxy });

bbproxy().bonboot({ context: { states: bonbon_state } });
export default BonBonMMP;
