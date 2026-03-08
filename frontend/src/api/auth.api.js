import axiosInstance from "./axiosInstance.js";

export const registerUser = (data) =>
  axiosInstance.post("/users/register", data);

export const loginUser = (data) => axiosInstance.post("/users/login", data);

export const logoutUser = () => axiosInstance.post("/users/logout");

export const getCurrentUser = () => axiosInstance.get("/users/current-user");

export const getUserChannelProfile = (username) =>
  axiosInstance.get(`/users/c/${username}`);

export const getWatchHistory = () => axiosInstance.get("/users/history");

export const updateAccountDetails = (data) =>
  axiosInstance.patch("/users/update-account", data);

export const updateAvatar = (data) =>
  axiosInstance.patch("/users/avatar", data);

export const updateCoverImage = (data) =>
  axiosInstance.patch("/users/cover-image", data);

export const changePassword = (data) =>
  axiosInstance.post("/users/change-password", data);
