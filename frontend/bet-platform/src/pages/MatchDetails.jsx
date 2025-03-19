import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MatchDetails.css";

const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

const MatchDetails = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!matchId) return;
    
    setLoading(true);
    fetch(`${API_URL}/sports/soccer/odds?apiKey=${API_KEY}&regions=us&markets=h2h,spreads,totals`)
      .then((res) => res.json())
      .then((data) => {
        const foundMatch = data.find((m) => m.id === matchId);
        setMatch(foundMatch || null);
      })
      .catch((error) => console.error("Error fetching match details:", error))
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) return <p>Φόρτωση...</p>;
  if (!match) return <p>Δεν βρέθηκαν δεδομένα για τον αγώνα</p>;

  const bookmaker = match.bookmakers[0]; // Επιλέγουμε μόνο έναν bookmaker
  if (!bookmaker) return <p>Δεν υπάρχουν διαθέσιμες αποδόσεις</p>;

  const h2hMarket = bookmaker.markets.find((m) => m.key === "h2h");
  const spreadsMarket = bookmaker.markets.find((m) => m.key === "spreads");
  const totalsMarket = bookmaker.markets.find((m) => m.key === "totals");

  return (
    <div className="match-details-container">
      <button onClick={() => navigate(-1)} className="back-button">🔙 Πίσω</button>
      <h2 className="match-title">{match.home_team} vs {match.away_team}</h2>
      <p className="match-time">Ημερομηνία: {new Date(match.commence_time).toLocaleString()}</p>

      <div className="bet-section">
        <h3>Τελικό Αποτέλεσμα</h3>
        <div className="bet-options">
          {h2hMarket?.outcomes.map((outcome) => (
            <button key={outcome.name} className="bet-button">
              {outcome.name} ({outcome.price})
            </button>
          ))}
        </div>
      </div>

      <div className="bet-section">
        <h3>Χάντικαπ</h3>
        <div className="bet-options">
          {spreadsMarket?.outcomes.map((outcome) => (
            <button key={outcome.name} className="bet-button">
              {outcome.name} {outcome.point} ({outcome.price})
            </button>
          ))}
        </div>
      </div>

      <div className="bet-section">
        <h3>Over / Under</h3>
        <div className="bet-options">
          {totalsMarket?.outcomes.map((outcome) => (
            <button key={outcome.name} className="bet-button">
              {outcome.name} {outcome.point} ({outcome.price})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
