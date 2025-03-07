import { create } from "zustand";
import api from "../services/api";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,

  login: async (username, password) => {
    try {
      const response = await api.post(`${API_URL}/token/`, { username, password });

      const token = response.data.access;
      const user = response.data.user;  // Παίρνουμε το user object με το role

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));  
      set({ user, token });

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  },

  checkAuth: () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      set({ user, token });
    } else {
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
