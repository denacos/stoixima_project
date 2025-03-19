import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthProvider";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Μετατροπή υπολοίπου σε δύο δεκαδικά χωρίς σύμβολο νομίσματος
  const userBalance = user?.balance ? user.balance.toFixed(2).replace(".", ",") : "0,00";

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      {/* 🔹 Τίτλος Πλατφόρμας */}
      <h1 className="text-lg font-bold">
        <Link to="/">Bet Platform</Link>
      </h1>

      {/* 🔹 Δεξιά πλευρά */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {/* 🔹 Λογαριασμός Χρήστη (Dropdown) */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-900 transition duration-200"
              >
                Λογαριασμός ({userBalance})
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
                  <Link to="/settings" className="block px-4 py-2 hover:bg-gray-200">Ρυθμίσεις</Link>
                  <Link to="/bets" className="block px-4 py-2 hover:bg-gray-200">Τα στοιχήματά μου</Link>
                  <Link to="/transactions" className="block px-4 py-2 hover:bg-gray-200">Ιστορικό</Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                  >
                    Αποσύνδεση
                  </button>
                </div>
              )}
            </div>

            {/* 🔹 Logout Button */}
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-700 transition duration-200">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="px-4 py-2 bg-green-500 rounded hover:bg-green-700 transition duration-200">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
