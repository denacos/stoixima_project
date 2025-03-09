import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext({
    user: null,
    token: null,  // ➡ Προσθέτουμε το token
    login: () => {},
    logout: () => {},
    hasRole: () => false,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);  // ➡ Αποθήκευση token

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("authToken");  // 🔹 Φορτώνουμε το token

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedToken) setToken(storedToken);
    }, []);

    const login = (userData, accessToken, refreshToken) => {
        setUser(userData);
        localStorage.setItem("authToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
    };

    const hasRole = (roles) => {
        if (!user || !user.role) return false;
        return roles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
