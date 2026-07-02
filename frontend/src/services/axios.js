import axios from "axios";
import { clearAuthState } from "../utils/cookie";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

const refreshSession = async () => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = apiClient
    .post("/auth/refresh")
    .then(() => true)
    .catch(() => {
      clearAuthState();
      return false;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.__isRetry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      const refreshed = await refreshSession();

      if (refreshed) {
        originalRequest.__isRetry = true;
        return apiClient(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      clearAuthState();
      if (!window.location.pathname.startsWith("/auth/")) {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
