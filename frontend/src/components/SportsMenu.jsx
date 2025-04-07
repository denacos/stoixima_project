import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const SportsMenu = ({ onSelectCategory, activeCategory }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  // ✅ Τα menu items ανά ρόλο
  const menuItems = {
    user: [
      { id: "live", label: "Σε-Εξέλιξη", path: "/" },
      { id: "sports", label: "Όλα τα Σπορ", path: "/pregame/1" },
      { id: "casino", label: "Καζίνο", path: "/casino" },
    ],
    cashier: [
      { id: "live", label: "Σε-Εξέλιξη", path: "/" },
      { id: "sports", label: "Όλα τα Σπορ", path: "/pregame/1" },
    ],
  };

  const itemsToRender = menuItems[user.role] || [];

  const getButtonClass = (category) =>
    `menu-btn px-4 py-2 text-white rounded text-sm ${
      activeCategory === category
        ? "bg-green-700 font-semibold"
        : "bg-green-900 hover:bg-green-800"
    }`;

  return (
    <div className="sports-menu flex justify-center gap-4 py-2 bg-green-900 text-white">
      {itemsToRender.map(({ id, label, path }) => (
        <button
          key={id}
          onClick={() => {
            onSelectCategory(id);
            navigate(path);
          }}
          className={getButtonClass(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default SportsMenu;
