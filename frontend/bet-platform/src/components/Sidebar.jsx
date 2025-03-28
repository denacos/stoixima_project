import React from "react";

import { FaFutbol, FaBasketballBall, FaVolleyballBall, FaTableTennis, FaFootballBall, FaRunning, FaSwimmer, FaSkiing, FaBiking, FaDice, FaThList } from "react-icons/fa";

const sports = [
  { name: "Ποδόσφαιρο", icon: <FaFutbol /> },
  { name: "Μπάσκετ", icon: <FaBasketballBall /> },
  { name: "Βόλεϊ", icon: <FaVolleyballBall /> },
  { name: "Πινγκ πονγκ", icon: <FaTableTennis /> },
  { name: "Αμερ. Ποδόσφαιρο", icon: <FaFootballBall /> },
  { name: "Στίβος", icon: <FaRunning /> },
  { name: "Κολύμβηση", icon: <FaSwimmer /> },
  { name: "Σκι", icon: <FaSkiing /> },
  { name: "Ποδηλασία", icon: <FaBiking /> },
  { name: "Καζίνο", icon: <FaDice /> },
];

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaThList className="sidebar-icon" /> ΠΛΗΡΗΣ ΛΙΣΤΑ
      </div>
      <ul className="sidebar-sports">
        {sports.map((sport, index) => (
          <li key={index} className="sidebar-item">
            <span className="sidebar-icon">{sport.icon}</span>
            <span className="sidebar-label">{sport.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
