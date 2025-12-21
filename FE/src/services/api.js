/**
 * API service for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Get authentication token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Set authentication token in localStorage
 */
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem("token");
};

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Set user data in localStorage
 */
export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

/**
 * Remove user data from localStorage
 */
export const removeUser = () => {
  localStorage.removeItem("user");
};

/**
 * Make API request with authentication
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "An error occurred",
    }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    const response = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response;
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response;
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    return apiRequest("/api/user/profile");
  },
};

/**
 * Messages API
 */
export const messagesAPI = {
  /**
   * Get user messages
   */
  getMessages: async (historyId = null, limit = 50) => {
    const url = historyId
      ? `/api/messages?history_id=${historyId}&limit=${limit}`
      : `/api/messages?limit=${limit}`;
    return apiRequest(url);
  },

  /**
   * Save a message
   */
  saveMessage: async (message) => {
    return apiRequest("/api/messages", {
      method: "POST",
      body: JSON.stringify(message),
    });
  },
};

/**
 * History API
 */
export const historyAPI = {
  /**
   * Get chat history
   */
  getHistory: async (limit = 20) => {
    return apiRequest(`/api/history?limit=${limit}`);
  },

  /**
   * Save chat history
   */
  saveHistory: async (history) => {
    return apiRequest("/api/history", {
      method: "POST",
      body: JSON.stringify(history),
    });
  },

  /**
   * Delete chat history
   */
  deleteHistory: async (historyId) => {
    return apiRequest(`/api/history/${historyId}`, {
      method: "DELETE",
    });
  },
};

/**
 * Summarization API
 */
export const summarizeAPI = {
  /**
   * Summarize text
   */
  summarize: async (text) => {
    return apiRequest("/api/summarize", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },
};
