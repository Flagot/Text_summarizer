import { configureStore } from "@reduxjs/toolkit";
import messagesReducer from "./messagesSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    messages: messagesReducer,
    auth: authReducer,
  },
});
