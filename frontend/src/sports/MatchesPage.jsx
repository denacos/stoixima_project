import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MatchesPage.css";

const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

const MatchesPage = ({ leagueKey, onBack, addBet }) => {
  if (!addBet) {
    console.error("❌ ERROR: Το addBet δεν πέρασε σωστά στο MatchesPage!");
  }

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!leagueKey) return;

    setLoading(true);
    fetch(`${API_URL}/sports/${leagueKey}/odds?apiKey=${API_KEY}&regions=us&markets=h2h`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ API Response:", data);
        setMatches(data || []);
      })
      .catch((error) => console.error("Error fetching matches:", error))
      .finally(() => setLoading(false));
  }, [leagueKey]);

  const handleBetSelection = (match, outcome) => {
    if (typeof addBet !== "function") {
      console.error("❌ addBet ΔΕΝ ΕΙΝΑΙ ΣΥΝΑΡΤΗΣΗ! (ΕΛΕΓΞΕ ΤΟ App.js)");
      return;
    }

    const bet = {
      match_id: match.id,
      choice: outcome.name,
      odds: outcome.price,
      stake: 10,
    };

    addBet(bet);
  };

  return (
    <div className="matches-container">
      <button onClick={onBack} className="odd-button">🔙 Επιστροφή στις Διοργανώσεις</button>
      <h2 className="matches-header">Αγώνες</h2>

      {loading ? (
        <p>Φόρτωση...</p>
      ) : matches.length > 0 ? (
        <table className="matches-table">
          <thead>
            <tr>
              <th>Ομάδες</th><th>1</th><th>X</th><th>2</th><th></th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              const bookmaker = match.bookmakers?.[0];
              if (!bookmaker) return null;

              const market = bookmaker.markets?.find((m) => m.key === "h2h");
              const homeOdd = market?.outcomes?.find((o) => o.name === match.home_team);
              const drawOdd = market?.outcomes?.find((o) => o.name === "Draw");
              const awayOdd = market?.outcomes?.find((o) => o.name === match.away_team);

              return (
                <tr key={match.id} className="match-row">
                  <td>
                    <span className="team-name">{match.home_team}</span> vs <span className="team-name">{match.away_team}</span>
                    <br />
                    <span className="match-time">{new Date(match.commence_time).toLocaleString()}</span>
                  </td>
                  <td>
                    {homeOdd ? (
                      <button className="odd-button" onClick={() => handleBetSelection(match, homeOdd)}>
                        {homeOdd.price}
                      </button>
                    ) : "-"}
                  </td>
                  <td>
                    {drawOdd ? (
                      <button className="odd-button" onClick={() => handleBetSelection(match, drawOdd)}>
                        {drawOdd.price}
                      </button>
                    ) : "-"}
                  </td>
                  <td>
                    {awayOdd ? (
                      <button className="odd-button" onClick={() => handleBetSelection(match, awayOdd)}>
                        {awayOdd.price}
                      </button>
                    ) : "-"}
                  </td>
                  <td>
                    <button className="odd-button" onClick={() => navigate(`/match/${match.id}`)}>▶</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>Δεν βρέθηκαν διαθέσιμοι αγώνες</p>
      )}
    </div>
  );
};

export default MatchesPage;
