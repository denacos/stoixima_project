import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import {
  Wallet,
  User,
  Settings,
  LogOut,
  MessageCircle,
  Repeat,
  ScrollText,
} from "lucide-react";

const Navbar = () => {
  const { authTokens, logout } = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menuRef = useRef(null);

  // 🔁 Click έξω για να κλείνει το popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userBalance = user?.balance
    ? user.balance.toFixed(2).replace(".", ",")
    : "0,00";
  const nickname = user?.nickname || "user";

  return (
    <nav className="bg-[#1a1f1c] text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">
        <Link to="/">Bet Platform</Link>
      </h1>

      {authTokens && user && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-4 py-2 bg-[#2d352e] text-white rounded hover:bg-[#3b443a] transition duration-200 flex items-center gap-2"
          >
            <User size={18} /> ({userBalance})
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-[320px] bg-black text-[#1e1e1e] rounded-md shadow-lg z-50 text-sm border border-[#dcdcdc]">
              <div className="px-4 py-3 border-b border-[#e5e5e5]">
                <div className="font-semibold text-base">{nickname}</div>
                <div className="text-xs text-[#339966] font-semibold cursor-pointer">
                  Πορτοφόλια ↻
                </div>
                <div className="text-sm font-bold text-[#1e1e1e] mt-1">
                  € {userBalance}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Υπολειπόμενος χρόνος σύνδεσης:{" "}
                  <strong>2 ώρες 29 λεπτά</strong>
                </div>
              </div>

              <div className="px-2 py-3 grid grid-cols-3 gap-2 text-[#333]">
                <Link
                  to="/bets"
                  className="flex flex-col items-center justify-center gap-1 hover:bg-[#f2f2f2] rounded p-2"
                >
                  <ScrollText size={20} />
                  <span className="text-xs">Στοιχήματα</span>
                </Link>
                <Link
                  to="/transactions"
                  className="flex flex-col items-center justify-center gap-1 hover:bg-[#f2f2f2] rounded p-2"
                >
                  <Repeat size={20} />
                  <span className="text-xs">Μεταφορές</span>
                </Link>
                <Link
                  to="/wallet"
                  className="flex flex-col items-center justify-center gap-1 hover:bg-[#f2f2f2] rounded p-2"
                >
                  <Wallet size={20} />
                  <span className="text-xs">Ταμεία</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex flex-col items-center justify-center gap-1 hover:bg-[#f2f2f2] rounded p-2"
                >
                  <User size={20} />
                  <span className="text-xs">Λογαριασμός</span>
                </Link>
                <Link
                  to="/preferences"
                  className="flex flex-col items-center justify-center gap-1 hover:bg-[#f2f2f2] rounded p-2"
                >
                  <Settings size={20} />
                  <span className="text-xs">Ρυθμίσεις</span>
                </Link>
                <Link
                  to="/chat"
                  className="flex flex-col items-center justify-center gap-1 hover:bg-[#f2f2f2] rounded p-2"
                >
                  <MessageCircle size={20} />
                  <span className="text-xs">Chat</span>
                </Link>
              </div>

              <div className="border-t border-[#e5e5e5] px-4 py-3">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-100 rounded px-3 py-2 w-full"
                >
                  <LogOut size={16} /> Αποσύνδεση
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
