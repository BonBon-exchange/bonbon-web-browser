/* eslint-disable import/prefer-default-export */
import { useAppSelector } from 'renderer/App/store/hooks';
import { ChatState } from 'types/chat';

export const useChat = () => {
  const { chat }: { chat: ChatState } = useAppSelector(
    (state) => state.chat
  );

  return chat;
};
