import React, { useState, useEffect } from "react";
import { FaFutbol, FaBasketballBall, FaFootballBall, FaBaseballBall, FaHockeyPuck, FaTableTennis, FaVolleyballBall } from "react-icons/fa";
import "./Sidebar.css";

const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

const sportIcons = {
  Soccer: <FaFutbol />, 
  Basketball: <FaBasketballBall />,
  "American Football": <FaFootballBall />,
  Baseball: <FaBaseballBall />,
  Hockey: <FaHockeyPuck />,
  Tennis: <FaTableTennis />,
  Volleyball: <FaVolleyballBall />,
};

const Sidebar = ({ onSelectSport }) => {
  const [sports, setSports] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/sports?apiKey=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => {
        const uniqueSports = [...new Set(data.map((sport) => sport.group))];
        setSports(uniqueSports);
      })
      .catch((error) => console.error("Error fetching sports:", error));
  }, []);

  return (
    <div className="sidebar">
      <h2>Δημοφιλή</h2>
      <ul>
        {sports.length > 0 ? (
          sports.map((sport, index) => (
            <li key={index} className="sidebar-item">
              <button onClick={() => onSelectSport(sport)}>
                {sportIcons[sport] || <FaFutbol />} {sport}
              </button>
            </li>
          ))
        ) : (
          <p>Φόρτωση...</p>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
