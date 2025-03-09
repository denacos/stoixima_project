import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, hasRole } = useContext(AuthContext); // ✅ Παίρνουμε το hasRole από το context

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">
        <Link to="/">Bet Platform</Link>
      </h1>

      <div className="flex space-x-4">
        {user ? (
          <>
            {hasRole(["admin"]) && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/manage-users">Διαχείριση Χρηστών</Link>
                <Link to="/manage-finances">Οικονομικά</Link>
              </>
            )}

            {hasRole(["boss"]) && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/manage-managers">Διαχείριση Managers</Link>
                <Link to="/reports">Αναφορές</Link>
              </>
            )}

            {hasRole(["manager"]) && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/manage-cashiers">Διαχείριση Ταμιών</Link>
                <Link to="/financial-reports">Οικονομικές Αναφορές</Link>
              </>
            )}

            {hasRole(["cashier"]) && (
              <>
                <Link to="/cashier">Ταμείο</Link>
                <Link to="/manage-users">Οι Χρήστες μου</Link>
                <Link to="/place-bets">Τοποθέτηση Στοιχήματος</Link>
              </>
            )}

            {hasRole(["user"]) && (
              <>
                <Link to="/user/history">Ιστορικό Στοιχημάτων</Link>
                <Link to="/place-bet">Τοποθέτηση Στοιχήματος</Link>
              </>
            )}

            <button 
              onClick={logout} 
              className="ml-4 px-4 py-2 bg-red-500 rounded hover:bg-red-700 transition duration-200">
              Logout
            </button>
          </>
        ) : (
          <Link to="/" className="px-4 py-2 bg-green-500 rounded hover:bg-green-700 transition duration-200">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
