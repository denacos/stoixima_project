import { useEffect, useState } from "react";

const MatchDetails = ({ selectedMatch }) => {
  const [markets, setMarkets] = useState([]);
  const API_KEY = process.env.REACT_APP_ODDS_API_KEY;
  const API_URL = `https://api.the-odds-api.com/v4/sports/${selectedMatch.sport_key}/odds`;

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch(`${API_URL}?apiKey=${API_KEY}`);
        if (!response.ok) throw new Error("Αποτυχία φόρτωσης αγορών.");
        const data = await response.json();
        const matchMarkets = data.find(match => match.id === selectedMatch.id);
        setMarkets(matchMarkets ? matchMarkets.bookmakers[0]?.markets : []);
      } catch (error) {
        console.error("Σφάλμα φόρτωσης αγορών:", error);
      }
    };
    fetchMarkets();
  }, [selectedMatch]);

  return (
    <div className="match-details">
      <h2>{selectedMatch.home_team} vs {selectedMatch.away_team}</h2>
      {markets.length > 0 ? (
        <ul>
          {markets.map((market) => (
            <li key={market.key}>
              <strong>{market.key}</strong>: {market.outcomes.map(outcome => `${outcome.name}: ${outcome.price}`).join(", ")}
            </li>
          ))}
        </ul>
      ) : (
        <p>Δεν υπάρχουν διαθέσιμες αγορές.</p>
      )}
    </div>
  );
};

export default MatchDetails;
