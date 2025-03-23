import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";


const AllMatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [searchParams] = useSearchParams();
  const sportId = searchParams.get("sport_id") || "1";

  useEffect(() => {
    axiosInstance
      .get(`/pregame-matches/?sport_id=${sportId}`)
      .then((res) => setMatches(res.data))
      .catch((err) => console.error("❌ Error loading matches:", err));
  }, [sportId]);

  return (
    <div style={{ padding: "20px", backgroundColor: "#111", color: "white", minHeight: "100vh" }}>
      <h2 style={{ color: "#9de167", marginBottom: "20px" }}>
        📅 Όλοι οι Αγώνες (Άθλημα ID: {sportId})
      </h2>
      {matches.length === 0 ? (
        <p>⏳ Φόρτωση αγώνων...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#222" }}>
              <th style={{ padding: "10px", borderBottom: "1px solid #333" }}>Ώρα</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #333" }}>Διοργάνωση</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #333" }}>Αγώνας</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} style={{ borderBottom: "1px solid #333" }}>
                <td style={{ padding: "8px" }}>
                  {new Date(match.time * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td style={{ padding: "8px" }}>{match.league}</td>
                <td style={{ padding: "8px" }}>{match.home_team} vs {match.away_team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllMatchesPage;
