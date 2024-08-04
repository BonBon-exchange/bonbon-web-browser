import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState } from 'types/chat';

export type ChatSliceState = {
  chat: ChatState
}

export const initialState: ChatSliceState = {
  chat: {
    username: '',
    isMagic: false,
    runners: {},
    visibleRunner: null
  }
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatState: (state, action: PayloadAction<ChatState>) => {
      state.chat = action.payload
    }
  },
});

export const { setChatState } = chatSlice.actions;

export default chatSlice.reducer;
