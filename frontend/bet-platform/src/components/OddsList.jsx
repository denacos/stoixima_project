import { useEffect, useState } from "react";

const OddsList = ({ selectedLeague, onSelectMatch }) => {
  const [matches, setMatches] = useState([]);
  const API_KEY = process.env.REACT_APP_ODDS_API_KEY;
  const API_URL = `https://api.the-odds-api.com/v4/sports/${selectedLeague}/odds`;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`${API_URL}?apiKey=${API_KEY}`);
        if (!response.ok) throw new Error("Αποτυχία φόρτωσης αγώνων.");
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Σφάλμα φόρτωσης αγώνων:", error);
      }
    };
    fetchMatches();
  }, [selectedLeague]);

  return (
    <div className="matches-container">
      <h2>Αγώνες για τη διοργάνωση: {selectedLeague}</h2>
      <ul>
        {matches.map((match) => (
          <li key={match.id} onClick={() => onSelectMatch(match)}>
            {match.home_team} vs {match.away_team}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OddsList;
