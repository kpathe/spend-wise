import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("userLoggedIn");
      localStorage.removeItem("spendwiseUserName");
      // Avoid redirecting from auth pages to prevent loops
      if (!window.location.pathname.startsWith("/auth/")) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
