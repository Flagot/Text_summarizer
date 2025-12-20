import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [], // array to store all messages
  inputText: "", // input text state
  history: [], // history state
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      // action.payload is the new message object
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setInputText: (state, action) => {
      state.inputText = action.payload;
    },
    clearInputText: (state) => {
      state.inputText = "";
    },
    addHistory: (state, action) => {
      // action.payload is the new message object
      state.history.push(action.payload);
    },
  },
});

export const {
  addMessage,
  clearMessages,
  setInputText,
  clearInputText,
  addHistory,
} = messagesSlice.actions;
export default messagesSlice.reducer;
