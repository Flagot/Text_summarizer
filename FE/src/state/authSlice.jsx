import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  authAPI,
  setToken,
  removeToken,
  setUser,
  removeUser,
} from "../services/api";

// Async thunks for authentication
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      // Store token and user data
      setToken(response.access_token);
      setUser(response.user);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      setUser(response);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Load user from localStorage on initialization
const token = localStorage.getItem("token");
const userStr = localStorage.getItem("user");
if (token && userStr) {
  initialState.token = token;
  initialState.user = JSON.parse(userStr);
  initialState.isAuthenticated = true;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      removeToken();
      removeUser();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Profile
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // If token is invalid, logout
        if (
          action.payload.includes("Invalid") ||
          action.payload.includes("401")
        ) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          removeToken();
          removeUser();
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
