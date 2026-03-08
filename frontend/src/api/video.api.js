import axiosInstance from "./axiosInstance.js";

export const getAllVideos = (params) =>
  axiosInstance.get("/videos", { params });

export const getVideoById = (videoId) =>
  axiosInstance.get(`/videos/${videoId}`);

export const publishVideo = (data) =>
  axiosInstance.post("/videos", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateVideo = (videoId, data) =>
  axiosInstance.patch(`/videos/${videoId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteVideo = (videoId) =>
  axiosInstance.delete(`/videos/${videoId}`);

export const togglePublishStatus = (videoId) =>
  axiosInstance.patch(`/videos/toggle/publish/${videoId}`);
