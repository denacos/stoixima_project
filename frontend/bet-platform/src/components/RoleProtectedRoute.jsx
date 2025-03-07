import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuthStore();

  // Αν δεν υπάρχει χρήστης ή δεν έχει τον απαιτούμενο ρόλο, τον επιστρέφουμε στη σελίδα login
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
