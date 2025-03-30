import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => ({
    access: localStorage.getItem("access"),
    refresh: localStorage.getItem("refreshToken"),
  }));

  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const login = (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refreshToken", refresh);
    setAuthTokens({ access, refresh });

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  };

  const logout = () => {
    localStorage.clear();
    setAuthTokens(null);
    setUser(null);
  };

  // Keep user in sync when page reloads
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authTokens, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
