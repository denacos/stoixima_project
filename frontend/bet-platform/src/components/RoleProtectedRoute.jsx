import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

const RoleProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    console.log("🔄 RoleProtectedRoute - Έλεγχος χρήστη...");
    console.log("➡ loading:", loading);
    console.log("➡ user:", user);

    if (loading) {
        return <p>Φόρτωση...</p>;
    }

    if (!user) {
        console.log("🚨 Ο χρήστης δεν είναι συνδεδεμένος! Ανακατεύθυνση στο /login...");
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        console.log("🚫 Ο χρήστης δεν έχει πρόσβαση! Ανακατεύθυνση στο /unauthorized...");
        return <Navigate to="/unauthorized" replace />;
    }

    console.log("✅ Ο χρήστης έχει πρόσβαση:", user);
    return <Outlet />;
};

export default RoleProtectedRoute;
