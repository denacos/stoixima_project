import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const PregameOddsPage = () => {
  const { matchId } = useParams();
  const [odds, setOdds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/pregame-odds/${matchId}/`)
      .then((res) => {
        setOdds(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Αποτυχία φόρτωσης αποδόσεων.");
        setLoading(false);
      });
  }, [matchId]);

  if (loading) return <p style={{ color: "white", padding: 20 }}>⏳ Φόρτωση αποδόσεων...</p>;
  if (error) return <p style={{ color: "red", padding: 20 }}>{error}</p>;
  if (!odds || odds.length === 0) return <p style={{ color: "white", padding: 20 }}>Δεν υπάρχουν αποδόσεις.</p>;

  return (
    <div style={{ padding: 20, backgroundColor: "#111", color: "white", minHeight: "100vh" }}>
      <h2 style={{ color: "#9de167", marginBottom: 20 }}>📊 Αποδόσεις Αγώνα</h2>

      {odds.map((item, idx) => (
        <div key={idx} style={{ marginBottom: 30 }}>
          <h4 style={{ color: "#ccc" }}>Event ID: {item.event_id}</h4>

          {item.main?.sp?.full_time_result && (
            <div style={{ marginTop: 10 }}>
              <h5 style={{ color: "#9de167" }}>1X2 (Τελικό Αποτέλεσμα):</h5>
              <div style={{ display: "flex", gap: "10px" }}>
                {item.main.sp.full_time_result.map((odd, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "#222",
                      padding: "10px",
                      borderRadius: "5px",
                      color: "white",
                    }}
                  >
                    <div>{odd.name}</div>
                    <strong>{odd.odds}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Άλλες κατηγορίες π.χ. Double Chance */}
          {item.main?.sp?.double_chance && (
            <div style={{ marginTop: 20 }}>
              <h5 style={{ color: "#9de167" }}>Double Chance:</h5>
              <div style={{ display: "flex", gap: "10px" }}>
                {item.main.sp.double_chance.map((odd, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "#222",
                      padding: "10px",
                      borderRadius: "5px",
                      color: "white",
                    }}
                  >
                    <div>{odd.name}</div>
                    <strong>{odd.odds}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PregameOddsPage;
