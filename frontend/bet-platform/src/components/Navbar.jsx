import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="text-lg font-bold">Bet Platform</h1>
      
      <div className="space-x-4">
        {user ? (
          <>
            {user.role === "admin" && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/manage-users">Διαχείριση Χρηστών</Link>
                <Link to="/manage-finances">Οικονομικά</Link>
              </>
            )}

            {user.role === "boss" && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/manage-managers">Διαχείριση Managers</Link>
                <Link to="/reports">Αναφορές</Link>
              </>
            )}

            {user.role === "manager" && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/manage-cashiers">Διαχείριση Ταμιών</Link>
                <Link to="/financial-reports">Οικονομικές Αναφορές</Link>
              </>
            )}

            {user.role === "cashier" && (
              <>
                <Link to="/cashier">Ταμείο</Link>
                <Link to="/manage-users">Οι Χρήστες μου</Link>
                <Link to="/place-bets">Τοποθέτηση Στοιχήματος</Link>
              </>
            )}

            {user.role === "user" && (
              <>
                <Link to="/user/history">Ιστορικό Στοιχημάτων</Link>
                <Link to="/place-bet">Τοποθέτηση Στοιχήματος</Link>
              </>
            )}

            <button onClick={logout} className="ml-4 px-4 py-2 bg-red-500 rounded">
              Logout
            </button>
          </>
        ) : (
          <Link to="/">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
