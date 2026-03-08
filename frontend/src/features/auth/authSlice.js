import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authApi from "../../api/auth.api.js";
import toast from "react-hot-toast";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.registerUser(data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.loginUser(data);
      // Tokens are set as httpOnly cookies by the backend
      // We only receive and store the user data
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Backend will clear httpOnly cookies during logout
      await authApi.logoutUser();
    } catch (error) {
      // Even if backend call fails, log the error but continue with cleanup
      console.error("Logout API error:", error.message);
      // Don't reject - we still want to clear the Redux state
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response.data.data;
    } catch (error) {
      // Backend will handle clearing httpOnly cookies on 401
      // We just clear Redux state
      return rejectWithValue(error.response?.data?.message || "Session expired");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    initialLoading: false, // Don't block initial render
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        toast.success("Registered successfully! Please login.");
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Registration failed");
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        toast.success(`Welcome back, ${action.payload?.fullName || ""}!`);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Login failed");
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        toast.success("Logged out successfully");
      })
      .addCase(logoutUser.rejected, (state) => {
        // Still clear state even if API call failed
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Fetch current user (on app load)
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.initialLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.initialLoading = false;
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.initialLoading = false;
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
