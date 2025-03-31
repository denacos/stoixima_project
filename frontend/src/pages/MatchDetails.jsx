import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MatchDetails.css";

const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

const MatchDetails = () => {
  const { leagueKey } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/bet365/upcoming?token=${API_KEY}&league_id=${leagueKey}`)
      .then((res) => res.json())
      .then((data) => {
        const results = data.results || [];
        setMatches(results);
      })
      .catch((err) => {
        console.error("❌ Error fetching matches:", err);
      });
  }, [leagueKey]);

  const handleMatchClick = (matchId) => {
    navigate(`/pregame-odds/${matchId}`);
  };

  return (
    <div className="match-details-container">
      <button onClick={() => navigate(-1)} className="back-button">🔙 Πίσω</button>
      <h2 className="match-title">⚽ Αγώνες Διοργάνωσης</h2>

      {matches.length === 0 ? (
        <p>⏳ Φόρτωση αγώνων...</p>
      ) : (
        <ul style={{ padding: 0 }}>
          {matches.map((match) => (
            <li
              key={match.id}
              onClick={() => handleMatchClick(match.id)}
              style={{
                cursor: "pointer",
                padding: "10px",
                backgroundColor: "#222",
                color: "white",
                marginBottom: "10px",
                borderRadius: "5px",
              }}
            >
              {match.home.name} vs {match.away.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MatchDetails;
