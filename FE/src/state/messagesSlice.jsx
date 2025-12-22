import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { messagesAPI, historyAPI } from "../services/api";

// Async thunks
export const saveMessage = createAsyncThunk(
  "messages/saveMessage",
  async (message, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.saveMessage(message);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadMessages = createAsyncThunk(
  "messages/loadMessages",
  async (historyId, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.getMessages(historyId);
      return { messages: response.messages || [], historyId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadHistory = createAsyncThunk(
  "messages/loadHistory",
  async (
    { limit = 20, skip = 0, append = false } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await historyAPI.getHistory(limit, skip);
      return {
        history: response.history || [],
        hasMore: response.has_more || false,
        append: append,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveHistory = createAsyncThunk(
  "messages/saveHistory",
  async (historyData, { rejectWithValue }) => {
    try {
      const response = await historyAPI.saveHistory(historyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  messages: [], // array to store all messages
  inputText: "", // input text state
  history: [], // history state
  currentHistoryId: null, // current history ID
  isLoading: false,
  error: null,
  hasMoreHistory: true, // whether there are more history items to load
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      // action.payload is the new message object
      // Check if message already exists to avoid duplicates
      const exists = state.messages.some((msg) => msg.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentHistoryId = null;
    },
    setInputText: (state, action) => {
      state.inputText = action.payload;
    },
    clearInputText: (state) => {
      state.inputText = "";
    },
    setCurrentHistoryId: (state, action) => {
      state.currentHistoryId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Save message
    builder
      .addCase(saveMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveMessage.fulfilled, (state, action) => {
        state.isLoading = false;

        // Handle new response format: backend returns both user_message and assistant_message
        const payload = action.payload;
        const historyId =
          payload.history_id ||
          payload.user_message?.history_id ||
          payload.assistant_message?.history_id;

        // Update currentHistoryId if this is the first message
        if (!state.currentHistoryId && historyId) {
          state.currentHistoryId = historyId;
        }

        // Helper function to process a single message
        const processMessage = (message) => {
          if (!message) return;

          const messageId = message._id || message.id;
          if (!messageId) return;

          // Check if message already exists by real ID
          const existingByRealId = state.messages.findIndex(
            (msg) => msg.id === messageId
          );

          const messageData = {
            id: messageId,
            role: message.role,
            content: message.content,
            timestamp: message.timestamp,
          };

          if (existingByRealId !== -1) {
            // Update existing message
            state.messages[existingByRealId] = messageData;
          } else {
            // Check if there's a temp message with the same role that we should replace
            let tempIndex = -1;
            for (let i = state.messages.length - 1; i >= 0; i--) {
              const msg = state.messages[i];
              const isTempMessage =
                msg.id &&
                (msg.id.startsWith("temp-") ||
                  msg.id.startsWith("temp-assistant-") ||
                  msg.id.startsWith("temp-user-") ||
                  msg.id.startsWith("assistant-"));
              if (isTempMessage && msg.role === message.role) {
                tempIndex = i;
                break;
              }
            }

            if (tempIndex !== -1) {
              // Replace temp message with saved message
              state.messages[tempIndex] = messageData;
            } else {
              // Add new message if no temp message found
              state.messages.push(messageData);
            }
          }
        };

        // Process both messages if they exist (new format)
        if (payload.user_message && payload.assistant_message) {
          processMessage(payload.user_message);
          processMessage(payload.assistant_message);
        } else if (payload.message) {
          // Handle old format (single message)
          processMessage(payload.message);
        } else if (payload._id) {
          // Handle direct message format (fallback)
          processMessage(payload);
        }
      })
      .addCase(saveMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Load messages
    builder
      .addCase(loadMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages.map((msg) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }));
        state.currentHistoryId = action.payload.historyId;
      })
      .addCase(loadMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Load history
    builder
      .addCase(loadHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        console.log("loadHistory.fulfilled - action.payload:", payload);

        if (payload.append && Array.isArray(payload.history)) {
          // Append new history to existing (for pagination)
          const existingIds = new Set(state.history.map((h) => h._id || h.id));
          const newHistory = payload.history.filter((h) => {
            const id = h._id || h.id;
            return id && !existingIds.has(id);
          });
          state.history = [...state.history, ...newHistory];
        } else if (Array.isArray(payload.history)) {
          // Replace history (initial load)
          state.history = payload.history;
        } else {
          // Fallback for old format
          state.history = Array.isArray(payload) ? payload : [];
        }

        state.hasMoreHistory = payload.hasMore || false;
        console.log(
          "loadHistory.fulfilled - state.history after update:",
          state.history.length,
          "hasMore:",
          state.hasMoreHistory
        );
      })
      .addCase(loadHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error("loadHistory.rejected - Error:", action.payload);
      });

    // Save history
    builder
      .addCase(saveHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add to history list (if not already there)
        const exists = state.history.some(
          (h) => (h._id || h.id) === (action.payload._id || action.payload.id)
        );
        if (!exists) {
          state.history.unshift(action.payload);
        }
        // Clear current messages
        state.messages = [];
        state.currentHistoryId = null;
      })
      .addCase(saveHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addMessage,
  setMessages,
  clearMessages,
  setInputText,
  clearInputText,
  setCurrentHistoryId,
} = messagesSlice.actions;
export default messagesSlice.reducer;
