import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";

const API_URL = process.env.REACT_APP_ODDS_API_URL; // URL του The Odds API
const API_KEY = process.env.REACT_APP_ODDS_API_KEY; // API Key του The Odds API

const BettingPage = ({ selectedSport }) => {
  const { token } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedSport) return;

    fetch(`${API_URL}/sports/${selectedSport}/leagues/`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP Error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setLeagues(data))
      .catch((err) => {
        console.error("Error fetching leagues:", err);
        setError("Αδυναμία φόρτωσης των διοργανώσεων.");
      });
  }, [selectedSport, token]);

  return (
    <div className="betting-page">
      <h2>Διοργανώσεις</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {leagues.map((league) => (
          <li key={league.key}>{league.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default BettingPage;