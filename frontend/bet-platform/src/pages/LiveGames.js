import { useState, useEffect } from "react";
import "./LiveGames.css";

const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

const LiveGames = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/sports/live?apiKey=${API_KEY}&regions=us&markets=h2h`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Live Matches API Response:", data);
        setLiveMatches(data || []);
      })
      .catch((error) => {
        console.error("❌ Error fetching live matches:", error);
        setError(error.message); // ✅ Χρήση του setError για να φύγει το warning
      })
      .finally(() => setLoading(false));
  }, []);
  
  

  return (
    <div className="live-games-container">
      <h2>⚡ Αγώνες σε Εξέλιξη</h2>

      {loading ? (
        <p>Φόρτωση αγώνων...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : liveMatches.length > 0 ? (
        <table className="live-matches-table">
          <thead>
            <tr>
              <th>Ομάδες</th>
              <th>1</th>
              <th>X</th>
              <th>2</th>
            </tr>
          </thead>
          <tbody>
            {liveMatches.map((match) => {
              const bookmaker = match.bookmakers?.[0];
              if (!bookmaker) return null;

              const market = bookmaker.markets?.find((m) => m.key === "h2h");
              const homeOdd = market?.outcomes?.find((o) => o.name === match.home_team);
              const drawOdd = market?.outcomes?.find((o) => o.name === "Draw");
              const awayOdd = market?.outcomes?.find((o) => o.name === match.away_team);

              return (
                <tr key={match.id} className="match-row">
                  <td>
                    <span className="team-name">{match.home_team}</span> vs{" "}
                    <span className="team-name">{match.away_team}</span>
                    <br />
                    <span className="match-time">⏳ Live</span>
                  </td>
                  <td>{homeOdd ? homeOdd.price : "-"}</td>
                  <td>{drawOdd ? drawOdd.price : "-"}</td>
                  <td>{awayOdd ? awayOdd.price : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>Δεν υπάρχουν αγώνες σε εξέλιξη αυτή τη στιγμή.</p>
      )}
    </div>
  );
};

export default LiveGames;
