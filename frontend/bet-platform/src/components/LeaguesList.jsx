import React, { useState, useEffect } from "react";

const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

const LeaguesList = ({ sportKey, onSelectLeague }) => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sportKey) return;

    setLoading(true);
    setError(null);

    console.log(`Fetching leagues for sport: ${sportKey}`);

    fetch(`${API_URL}/sports?apiKey=${API_KEY}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP Error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const filteredLeagues = data.filter((league) => league.group.toLowerCase() === sportKey.toLowerCase() && league.active);
        if (filteredLeagues.length === 0) {
          setError("Δεν υπάρχουν ενεργές διοργανώσεις για αυτό το άθλημα.");
        }
        setLeagues(filteredLeagues);
      })
      .catch((error) => {
        console.error("Error fetching leagues:", error);
        setError("Σφάλμα κατά τη φόρτωση των διοργανώσεων.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sportKey]);

  return (
    <div className="main-content">
      <h2>Διοργανώσεις</h2>
      {loading ? (
        <p>Φόρτωση...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <ul className="leagues-list">
          {leagues.map((league) => (
            <li key={league.key}>
              <button onClick={() => onSelectLeague(league.key)}>
                {league.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LeaguesList;
