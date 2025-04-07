import { createContext, useContext, useState, useEffect } from "react";
import axios from "../context/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refreshToken");
    return access && refresh ? { access, refresh } : null;
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const updateToken = async () => {
      if (!authTokens?.refresh) return;
      try {
        const response = await axios.post("token/refresh/", {
          refresh: authTokens.refresh,
        });
        const newAccess = response.data.access;
        const updatedTokens = { ...authTokens, access: newAccess };
        setAuthTokens(updatedTokens);
        localStorage.setItem("access", newAccess);

        const res = await axios.get("/users/me/");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("Token refresh failed", err);
        logout();
      }
    };

    const interval = setInterval(updateToken, 1000 * 60 * 4);
    return () => clearInterval(interval);
  }, [authTokens]);

  const logout = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ authTokens, setAuthTokens, user, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
