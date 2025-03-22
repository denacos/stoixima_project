import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import LiveGames from "../pages/LiveGames"; // ✅ Προσθήκη του LiveGames

const API_URL = process.env.REACT_APP_API_URL; // ✅ API URL από .env
const API_KEY = process.env.REACT_APP_API_KEY; // ✅ API Key από .env

const MainContent = ({ selectedSport }) => {
  const { token } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedSport || !token) return;

    fetch(`${API_URL}/api/sports/${selectedSport}/leagues/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
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
    <div className="main-content">
      <h2>Διοργανώσεις</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {leagues.map((league) => (
          <li key={league.key}>{league.name}</li>
        ))}
      </ul>
      {/* ✅ Εμφάνιση των Live Games */}
      <LiveGames />
    </div>
  );
};

export default MainContent;
