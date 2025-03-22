import { useEffect, useState } from "react";
import "./HomePage.css";

const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

const HomePage = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/sports/upcoming?apiKey=${API_KEY}&regions=eu&markets=h2h`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🎯 Upcoming Matches:", data);
        setMatches(data.slice(0, 12)); // Περιορίζουμε στους 12 πρώτους για slider
      })
      .catch((error) => {
        console.error("❌ Error fetching matches:", error);
      });
  }, []);

  return (
    <div className="home-page">
      <header className="top-bar">
        <div className="logo">Bet Platform</div>
        <nav className="top-nav">
          <span>Σε-Εξέλιξη</span>
          <span>Σπορ</span>
          <span>Στοιχήματα</span>
          <span>Καζίνο</span>
        </nav>
        <div className="user-info">
          <span>0.00 €</span>
          <div className="user-icon">👤</div>
        </div>
      </header>

      <section className="match-slider">
        {matches.map((match) => {
          const market = match.bookmakers?.[0]?.markets?.find((m) => m.key === "h2h");
          const outcomes = market?.outcomes || [];

          return (
            <div key={match.id} className="slider-item">
              <div className="teams">{match.home_team} vs {match.away_team}</div>
              <div className="odds">
                {outcomes.map((o, idx) => (
                  <button key={idx} className="odd-btn">{o.price}</button>
                ))}
              </div>
              <div className="match-time">{new Date(match.commence_time).toLocaleString("el-GR")}</div>
            </div>
          );
        })}
      </section>

      <section className="section-title">
        <h2>📍 Προσεχείς Αγώνες</h2>
      </section>

      <div className="match-grid">
        {matches.map((match) => (
          <div key={match.id} className="match-card">
            <div className="teams">
              <strong>{match.home_team}</strong> vs <strong>{match.away_team}</strong>
            </div>
            <div className="odds">
              {match.bookmakers?.[0]?.markets?.[0]?.outcomes?.map((o, i) => (
                <button key={i} className="odd-btn">{o.name}@{o.price}</button>
              ))}
            </div>
            <div className="match-time">
              {new Date(match.commence_time).toLocaleString("el-GR")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
