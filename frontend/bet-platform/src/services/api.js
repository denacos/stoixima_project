import axios from "axios";

// 🔹 Χρήση του .env για το API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔑 Αυτόματη προσθήκη token στα requests αν υπάρχει στο localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization; // Αποφυγή Bearer null
  }
  return config;
});

export default api;
