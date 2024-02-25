import axios from "axios";
import { getTokenFromStorage } from "./localStorageParser";

const API = axios.create({
  baseURL: import.meta.env.VITE_NIX_BACKEND,
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  const token = getTokenFromStorage();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config;
    if (error?.response?.status === 403 && !prevRequest?.sent) {
      prevRequest.sent = true;
      const newAccessToken = await refresh();
      prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return API(prevRequest);
    }
    // Redirect to login page or other error handling for different types of errors
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      window.location.href = "/login";
      localStorage.removeItem("token");
    }

    //here redirect to login page
    return Promise.reject(error);
  }
);

const refresh = async () => {
  try {
    const response = await API.get("/auth/refresh", {
      withCredentials: true,
    });
    localStorage.setItem("token", response?.data?.data?.accessToken);
    return response.data.data.accessToken;
  } catch (err) {
    console.log(err);
    return "";
  }
};

export default API;
