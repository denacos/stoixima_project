import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext({
    user: null,
    token: null,
    login: () => {},
    logout: () => {},
    hasRole: () => false,
    loading: true,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("🔄 Εκκίνηση AuthProvider - Έλεγχος localStorage...");
    
        try {
            const storedUser = localStorage.getItem("user");
            const storedToken = localStorage.getItem("authToken");
    
            if (storedUser && storedToken) {
                const parsedUser = JSON.parse(storedUser);
                console.log("✅ Ανάκτηση χρήστη από localStorage:", parsedUser);
                
                // 🔹 Ενημέρωση του state με το token
                setUser(parsedUser);
                setToken(storedToken);
            } else {
                console.log("❌ Δεν βρέθηκαν στοιχεία στο localStorage.");
            }
        } catch (error) {
            console.error("❌ Σφάλμα στην ανάκτηση χρήστη από το localStorage:", error);
        } finally {
            setTimeout(() => {
                console.log("✅ Τέλος φόρτωσης...");
                setLoading(false);
            }, 1000);
        }
    }, []);
    ;

    const login = (userData, accessToken, refreshToken) => {
        console.log("✅ Χρήστης συνδέθηκε:", userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("authToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setUser(userData);
        setToken(accessToken);
        setLoading(false);
    };

    const logout = () => {
        console.log("🚪 Αποσύνδεση χρήστη...");
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        setToken(null);
        setLoading(false);
    };

    const hasRole = (roles) => {
        return user?.role ? roles.includes(user.role) : false;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, hasRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ Δημιουργούμε το `useAuth()` hook για ευκολότερη χρήση της αυθεντικοποίησης
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthProvider;
