import axios from "axios";
import { getAuthToken, isAuthenticated, removeAuthToken, removeUserInfo } from "../utils/cookie";

const baseURL = "http://" + process.env.BACKEND_DOMAIN || "http://localhost:8080";

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  if (isAuthenticated()) {
    config.headers.Authorization = getAuthToken();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      removeAuthToken()
      removeUserInfo()
      window.location.href = "/login";
    }
    return Promise.reject(error)
  }
);

export default api;
