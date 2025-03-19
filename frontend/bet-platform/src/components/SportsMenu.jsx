import React from "react";
import "./SportsMenu.css";

const SportsMenu = ({ onSelectCategory }) => {
  return (
    <div className="sports-menu">
      <button onClick={() => onSelectCategory("sports")} className="menu-btn">Όλα τα Σπορ</button>
      <button onClick={() => onSelectCategory("live")} className="menu-btn">Σε-Εξέλιξη</button>
      <button onClick={() => onSelectCategory("casino")} className="menu-btn">Καζίνο</button>
    </div>
  );
};

export default SportsMenu;