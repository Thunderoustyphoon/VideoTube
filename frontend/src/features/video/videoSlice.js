import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as videoApi from "../../api/video.api.js";
import toast from "react-hot-toast";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchAllVideos = createAsyncThunk(
  "video/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await videoApi.getAllVideos(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch videos");
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  "video/fetchById",
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await videoApi.getVideoById(videoId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Video not found");
    }
  }
);

export const uploadVideo = createAsyncThunk(
  "video/upload",
  async (data, { rejectWithValue }) => {
    try {
      const response = await videoApi.publishVideo(data);
      toast.success("Video uploaded successfully!");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Upload failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const videoSlice = createSlice({
  name: "video",
  initialState: {
    videos: [],
    currentVideo: null,
    loading: false,
    uploadLoading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    totalVideos: 0,
  },
  reducers: {
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all videos
    builder
      .addCase(fetchAllVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVideos.fulfilled, (state, action) => {
        state.loading = false;
        // Handle custom labels from aggregatePaginate
        state.videos = action.payload?.videos || action.payload?.docs || [];
        state.totalPages = action.payload?.totalPages || 1;
        state.currentPage = action.payload?.page || 1;
        state.hasNextPage = action.payload?.hasNextPage || false;
        state.totalVideos = action.payload?.totalVideos || action.payload?.totalDocs || 0;
      })
      .addCase(fetchAllVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch single video
    builder
      .addCase(fetchVideoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideo = action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentVideo = null;
      });

    // Upload video
    builder
      .addCase(uploadVideo.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadVideo.fulfilled, (state) => {
        state.uploadLoading = false;
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentVideo, clearError } = videoSlice.actions;
export default videoSlice.reducer;
