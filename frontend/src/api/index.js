import axiosInstance from "./axiosInstance.js";

// Comments
export const getVideoComments = (videoId, params) =>
  axiosInstance.get(`/comments/${videoId}`, { params });

export const addComment = (videoId, data) =>
  axiosInstance.post(`/comments/${videoId}`, data);

export const updateComment = (commentId, data) =>
  axiosInstance.patch(`/comments/c/${commentId}`, data);

export const deleteComment = (commentId) =>
  axiosInstance.delete(`/comments/c/${commentId}`);

// Likes
export const toggleVideoLike = (videoId) =>
  axiosInstance.post(`/likes/toggle/v/${videoId}`);

export const toggleCommentLike = (commentId) =>
  axiosInstance.post(`/likes/toggle/c/${commentId}`);

export const getLikedVideos = () => axiosInstance.get("/likes/videos");

// Subscriptions
export const toggleSubscription = (channelId) =>
  axiosInstance.post(`/subscriptions/c/${channelId}`);

export const getChannelSubscribers = (channelId) =>
  axiosInstance.get(`/subscriptions/c/${channelId}`);

export const getSubscribedChannels = (subscriberId) =>
  axiosInstance.get(`/subscriptions/u/${subscriberId}`);

// Playlists
export const createPlaylist = (data) =>
  axiosInstance.post("/playlists", data);

export const getUserPlaylists = (userId) =>
  axiosInstance.get(`/playlists/user/${userId}`);

export const getPlaylistById = (playlistId) =>
  axiosInstance.get(`/playlists/${playlistId}`);

export const addVideoToPlaylist = (videoId, playlistId) =>
  axiosInstance.patch(`/playlists/add/${videoId}/${playlistId}`);

export const removeVideoFromPlaylist = (videoId, playlistId) =>
  axiosInstance.patch(`/playlists/remove/${videoId}/${playlistId}`);

export const deletePlaylist = (playlistId) =>
  axiosInstance.delete(`/playlists/${playlistId}`);

export const updatePlaylist = (playlistId, data) =>
  axiosInstance.patch(`/playlists/${playlistId}`, data);

// Dashboard
export const getChannelStats = () => axiosInstance.get("/dashboard/stats");

export const getChannelVideos = () => axiosInstance.get("/dashboard/videos");
