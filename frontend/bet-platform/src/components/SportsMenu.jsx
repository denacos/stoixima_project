import React from "react";

const SportsMenu = ({ onSelectCategory, activeCategory }) => {
  const getButtonClass = (category) =>
    `menu-btn px-4 py-2 text-white rounded ${
      activeCategory === category
        ? "bg-green-700 font-semibold"
        : "bg-green-900 hover:bg-green-800"
    }`;

  return (
    <div className="sports-menu flex justify-center gap-4 py-2 bg-green-900 text-sm text-white">
      <button onClick={() => onSelectCategory("sports")} className={getButtonClass("sports")}>
        Όλα τα Σπορ
      </button>
      <button onClick={() => onSelectCategory("live")} className={getButtonClass("live")}>
        Σε-Εξέλιξη
      </button>
      <button onClick={() => onSelectCategory("casino")} className={getButtonClass("casino")}>
        Καζίνο
      </button>
    </div>
  );
};

export default SportsMenu;
