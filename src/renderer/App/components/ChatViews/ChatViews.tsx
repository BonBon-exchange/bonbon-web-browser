import clsx from 'clsx'
import { ChatRunnerId } from 'types/chat';
// import EscapeTag from '../EscapeTag/EscapeTag';

import './ChatViews.scss';
import { useChat } from 'renderer/App/hooks/useChat';

export default () => {
  const chat = useChat()
  const runners = chat?.runners ?? {};

  return (
    <>
      {Object.keys(runners).map((runnerId: ChatRunnerId) => (
          <div className={clsx('chat-view', {'selected': chat.visibleRunner === runnerId})} key={`${runnerId}`}>
            {JSON.stringify(runners[runnerId ?? {}])}
          </div>
      ))}
    </>
  );
};
