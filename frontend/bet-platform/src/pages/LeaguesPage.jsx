import React, { useState, useEffect } from "react";
import MatchesPage from "./MatchesPage";
import { FaTrophy } from "react-icons/fa";
import "./LeaguesPage.css";

const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

const LeaguesPage = ({ sportKey, addBet }) => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);

  useEffect(() => {
    if (!sportKey) return;

    setLoading(true);
    fetch(`${API_URL}/sports?apiKey=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => {
        const filteredLeagues = data
          .filter((league) => league.group === sportKey)
          .map((league) => ({
            key: league.key,
            title: league.title,
          }));

        setLeagues(filteredLeagues);
      })
      .catch((error) => console.error("Error fetching leagues:", error))
      .finally(() => setLoading(false));
  }, [sportKey]);

  return (
    <div className="main-content">
      <h2>{sportKey.toUpperCase()}</h2>
      {loading ? (
        <p>Φόρτωση...</p>
      ) : (
        <ul className="league-list">
          {leagues.length > 0 ? (
            leagues.map((league) => (
              <li key={league.key} className="league-item">
                <button onClick={() => setSelectedLeague(league.key)}>
                  <FaTrophy className="league-icon" /> {league.title}
                </button>
              </li>
            ))
          ) : (
            <p>Δεν βρέθηκαν διαθέσιμες διοργανώσεις</p>
          )}
        </ul>
      )}
      {selectedLeague && (
        <MatchesPage leagueKey={selectedLeague} onBack={() => setSelectedLeague(null)} addBet={addBet} />
      )}
    </div>
  );
};

export default LeaguesPage;
