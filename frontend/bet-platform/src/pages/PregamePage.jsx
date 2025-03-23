import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const PregamePage = () => {
  const { sport_id } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get(`/pregame-matches/?sport_id=${sport_id}`)
      .then((res) => setMatches(res.data))
      .catch((err) => console.error("⚠️ Σφάλμα φόρτωσης αγώνων:", err))
      .finally(() => setLoading(false));
  }, [sport_id]);

  const goToOdds = (matchId) => {
    navigate(`/pregame-odds/${matchId}`);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#111", color: "#fff", minHeight: "100vh" }}>
      <h2 style={{ color: "#9de167", marginBottom: "20px" }}>📅 ΠΡΟΣΕΧΕΙΣ ΑΓΩΝΕΣ</h2>

      {loading ? (
        <p>⏳ Φόρτωση αγώνων...</p>
      ) : matches.length === 0 ? (
        <p>🚫 Δεν βρέθηκαν αγώνες για το επιλεγμένο άθλημα.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#222" }}>
              <th style={{ padding: "12px", borderBottom: "1px solid #333" }}>Ώρα</th>
              <th style={{ padding: "12px", borderBottom: "1px solid #333" }}>Ομάδες</th>
              <th style={{ padding: "12px", borderBottom: "1px solid #333" }}>Διοργάνωση</th>
              <th style={{ padding: "12px", borderBottom: "1px solid #333" }}></th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} style={{ borderBottom: "1px solid #333" }}>
                <td style={{ padding: "10px" }}>
                  {new Date(match.time * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td style={{ padding: "10px" }}>
                  {match.home.name} vs {match.away.name}
                </td>
                <td style={{ padding: "10px" }}>{match.league.name}</td>
                <td style={{ padding: "10px" }}>
                  <button
                    onClick={() => goToOdds(match.id)}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: "#28a745",
                      border: "none",
                      color: "#fff",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Αποδόσεις
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PregamePage;
