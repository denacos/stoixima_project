import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "../context/axiosInstance";
import {
  Wallet,
  User as UserIcon,
  Settings,
  LogOut,
  MessageCircle,
  Repeat,
  ScrollText,
  Plus,
  Users,
} from "lucide-react";

const Navbar = () => {
  const { authTokens, logout, user, setUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (!authTokens || !user) {
      navigate("/login");
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userBalance = user?.balance
    ? user.balance.toFixed(2).replace(".", ",")
    : "0,00";

  const nickname = user?.nickname || user?.username || "Χρήστης";

  // 🔁 Εικονίδια/επιλογές ανά ρόλο
  const menuItems = {
    user: [
      { to: "/bets", label: "Στοιχήματα", icon: <ScrollText size={20} /> },
      { to: "/transactions", label: "Μεταφορές", icon: <Repeat size={20} /> },
      { to: "/wallet", label: "Ταμεία", icon: <Wallet size={20} /> },
      { to: "/settings", label: "Λογαριασμός", icon: <UserIcon size={20} /> },
      { to: "/preferences", label: "Ρυθμίσεις", icon: <Settings size={20} /> },
      { to: "/chat", label: "Chat", icon: <MessageCircle size={20} /> },
    ],
    cashier: [
      { to: "/cashier/bets", label: "Στοιχήματα", icon: <ScrollText size={20} /> },
      { to: "/cashier/transfer", label: "Μεταφορές", icon: <Repeat size={20} /> },
      { to: "/cashier/balances", label: "Ταμεία", icon: <Wallet size={20} /> },
      { to: "/cashier/settings", label: "Λογαριασμός", icon: <UserIcon size={20} /> },
      { to: "/cashier/users", label: "Λίστα Χρηστών", icon: <Users size={20} /> },
      { to: "/cashier/create-user", label: "Δημιουργία Χρήστη", icon: <Plus size={20} /> },
      { to: "/cashier/chat", label: "Chat", icon: <MessageCircle size={20} /> },
    ],
  };

  const itemsToRender = menuItems[user?.role] || [];

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
            <UserIcon size={18} /> ({userBalance})
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-[320px] bg-black text-[#1e1e1e] rounded-md shadow-lg z-50 text-sm border border-[#dcdcdc]">
              <div className="px-4 py-3 border-b border-[#e5e5e5]">
                <div className="font-semibold text-base">{nickname}</div>
                <div
                  className="text-xs text-[#339966] font-semibold cursor-pointer"
                  onClick={async () => {
                    try {
                      const res = await axios.get("/users/user/balance");
                      const updatedUser = { ...user, balance: res.data.balance };
                      setUser(updatedUser);
                      localStorage.setItem("user", JSON.stringify(updatedUser));
                    } catch (err) {
                      console.error("Αποτυχία ανανέωσης υπολοίπου:", err);
                    }
                  }}
                >
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
                {itemsToRender.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex flex-col items-center justify-center gap-1 hover:bg-[#f2f2f2] rounded p-2"
                  >
                    {item.icon}
                    <span className="text-xs whitespace-nowrap text-center">{item.label}</span>
                  </Link>
                ))}
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
