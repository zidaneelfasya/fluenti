import Axios from "axios";

const getToken = () => {
  const token = localStorage.getItem("token");
  const expiresAt = localStorage.getItem("expiresAt");

  if (!token || !expiresAt || Date.now() > Number(expiresAt)) {
    localStorage.removeItem("token");
    localStorage.removeItem("expiresAt");
    return null;
  }

  return token;
};

const axios = Axios.create({
  baseURL: process.env.BASE_APP,
});

axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;
