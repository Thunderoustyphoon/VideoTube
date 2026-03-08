import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Ensures httpOnly cookies are sent with each request
  timeout: 30000, // 30 second timeout
});

// ── Token refresh queue (prevents race conditions) ────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// ── Request interceptor ───────────────────────────────────────────────────────
// No need to manually attach tokens - httpOnly cookies are automatically sent
// when withCredentials: true is set
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is always enabled
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ─────────────────────────────────
// When backend receives 401, it means the accessToken in httpOnly cookie is expired
// Backend's /refresh-token endpoint will validate refreshToken cookie and issue new accessToken
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry these routes to avoid infinite loops
    const shouldNotRetry =
      originalRequest.url?.includes("/refresh-token") ||
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/logout") ||
      originalRequest.url?.includes("/current-user") || // Don't retry current-user check
      originalRequest.skipRefresh; // Allow requests to opt-out of refresh

    if (error.response?.status === 401 && !originalRequest._retry && !shouldNotRetry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint - backend will validate cookies and issue new accessToken
        await axios.post(
          `${BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Backend has set new accessToken in httpOnly cookie
        // Retry the original request with new token
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - user session is invalid
        processQueue(refreshError);
        // Only redirect for user-initiated actions, not background checks
        if (!originalRequest.url?.includes("/current-user")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
