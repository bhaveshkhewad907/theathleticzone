import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { triggerLogout } from "../context/authEvents";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  // 🛡️ CRITICAL: This tells the browser to automatically attach the secure cookies!
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: { resolve: () => void; reject: (error: unknown) => void }[] =
  [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve();
  });
  failedQueue = [];
};

// ❌ Notice: We completely deleted the Request Interceptor!
// We don't need to manually attach Bearer tokens anymore because cookies are automatic.

// 🔁 RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) return Promise.reject(error);

    // Prevent infinite loops on the refresh endpoint itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // 1. This updates AuthContext securely, turning isAuthenticated to false
        triggerLogout();

        // 🛑 2. DELETED window.location.href!
        // We will no longer force a hard browser reload. React Router will
        // peacefully bounce you to the login page without any flickering.

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
