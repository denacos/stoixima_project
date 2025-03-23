import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const [selectedSportId, setSelectedSportId] = useState(1); // Default: Soccer
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPregameLeagues(selectedSportId);
  }, [selectedSportId]);

  const fetchPregameLeagues = async (sportId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/pregame-leagues/?sport_id=${sportId}`);
      setLeagues(response.data);
    } catch (err) {
      console.error("❌ Σφάλμα φόρτωσης pregame leagues:", err);
      setError("Αποτυχία φόρτωσης διοργανώσεων.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowAllMatches = () => {
    navigate(`/all-matches?sport_id=${selectedSportId}`);
  };

  const handleLeagueClick = (leagueKey) => {
    navigate(`/matches/${leagueKey}`);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar onSelectSport={(id) => setSelectedSportId(id)} />
      <div
        className="homepage-container"
        style={{
          marginLeft: "250px",
          padding: "20px",
          width: "100%",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <h2 className="homepage-title" style={{ color: "#9de167" }}>
          📍 Pregame Διοργανώσεις
        </h2>

        <button
          onClick={handleShowAllMatches}
          style={{
            marginBottom: "20px",
            padding: "10px 16px",
            backgroundColor: "#33cc33",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Εμφάνιση Όλων των Αγώνων
        </button>

        {loading && <p>⏳ Φόρτωση διοργανώσεων...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {leagues.map((league) => (
            <div
              key={league.key}
              onClick={() => handleLeagueClick(league.key)}
              style={{
                backgroundColor: "#292929",
                color: "#e2e2e2",
                padding: "10px",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#444")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#292929")}
            >
              <strong>{league.name}</strong>
              <div style={{ fontSize: "13px", marginTop: 4 }}>{league.country}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
