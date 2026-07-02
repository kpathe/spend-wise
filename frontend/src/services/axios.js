import axios from "axios";

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

const refreshAccessToken = async () => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = apiClient
    .post("/auth/refresh")
    .then(() => true)
    .catch(() => false)
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

    // Handle 401 - Token expired or unauthorized
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.__isRetry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        originalRequest.__isRetry = true;
        return apiClient(originalRequest);
      } else {
        // Refresh failed - redirect to login will be handled by AuthContext via /auth/me failing
        if (!window.location.pathname.startsWith("/auth/")) {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

