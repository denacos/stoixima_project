import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthProvider";
import BetButton from './ui/BetButton';


const BetSlip = ({ isOpen, onClose, betSlip, removeBet }) => {
  const { token } = useAuth();
  const [bets, setBets] = useState(betSlip);
  const [isMinimized, setIsMinimized] = useState(false);
  const [betType, setBetType] = useState("single");
  const [systemBets, setSystemBets] = useState([]);

  useEffect(() => {
    setBets(betSlip);
    if (token) {
      console.log("Token ενεργό:", token);
    }
  }, [betSlip, token]);

  const hasSameMatchMultipleBets = useMemo(() => {
    const ids = bets.map((bet) => bet?.match?.id).filter(Boolean);
    const count = {};
    for (const id of ids) {
      count[id] = (count[id] || 0) + 1;
      if (count[id] > 1) return true;
    }
    return false;
  }, [bets]);

  useEffect(() => {
    if (betType === "parlay" && hasSameMatchMultipleBets) {
      setBetType("single");
    }
  }, [betType, hasSameMatchMultipleBets]);

  const calculateSystemPayout = useCallback(
    (numSelections) => {
      const subsetOdds = bets
        .slice(0, numSelections)
        .reduce((acc, bet) => acc * bet.odds, 1);
      return (subsetOdds * 10).toFixed(2);
    },
    [bets]
  );

  useEffect(() => {
    if (betType === "system") {
      const newSystems = [];
      for (let i = 2; i <= bets.length; i++) {
        newSystems.push({
          name: `${i} Επιλογές`,
          odds: calculateSystemPayout(i),
          stake: "",
        });
      }
      setSystemBets(newSystems);
    }
  }, [bets, betType, calculateSystemPayout]);

  const calculateParlayPayout = () => {
    const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
    return (totalOdds * (bets[0]?.stake || 1)).toFixed(2);
  };

  const handleStakeChange = (index, newStake) => {
    const updated = [...bets];
    updated[index].stake = newStake;
    setBets(updated);
  };

  const handlePlaceBet = () => {
    if (betType === "parlay" && hasSameMatchMultipleBets) {
      alert("❌ Δεν μπορείτε να τοποθετήσετε παρολί με πολλαπλά σημεία από τον ίδιο αγώνα.");
      return;
    }

    console.log("📤 Τοποθέτηση στοιχήματος:", bets, "Τύπος:", betType);
    // TODO: σύνδεση με API
  };

  return (
    <div className={`betslip-container ${isMinimized ? "minimized" : "open"}`}>
      <div className="betslip-header" onClick={() => setIsMinimized(!isMinimized)}>
        <h2>Επιλογές</h2>
        <span className="toggle-btn">{isMinimized ? "⬆" : "⬇"}</span>
      </div>

      {!isMinimized && (
        <div className="betslip-body">
          {/* ✅ Επιλογή τύπου στοιχήματος */}
          <div className="bet-type-selection">
            <button
              onClick={() => setBetType("single")}
              className={betType === "single" ? "active" : ""}
            >
              Μονά
            </button>
            <button
              onClick={() => setBetType("parlay")}
              className={betType === "parlay" ? "active" : ""}
              disabled={hasSameMatchMultipleBets}
            >
              Παρολί
            </button>
            <button
              onClick={() => setBetType("system")}
              className={betType === "system" ? "active" : ""}
            >
              Σύστημα
            </button>
          </div>

          {/* ✅ Λίστα στοιχημάτων */}
          <div className="bet-list">
            {bets.length === 0 ? (
              <p className="empty-message">Δεν έχετε επιλέξει στοιχήματα.</p>
            ) : (
              bets.map((bet, index) => (
                <div key={index} className="bet-item">
                  <div className="bet-info">
                    <span className="bet-team">{bet.choice}</span>
                    <span className="bet-odds">@ {bet.odds}</span>
                  </div>
                  <div className="stake-input-container">
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Ποσό"
                      value={bet.stake || ""}
                      onChange={(e) =>
                        handleStakeChange(index, parseFloat(e.target.value) || "")
                      }
                    />
                  </div>
                  <button className="remove-bet" onClick={() => removeBet(index)}>
                    ✖
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ✅ Πληροφορίες Παρολί ή Σύστημα */}
          {bets.length > 0 && (
            <div className="betslip-footer">
              {betType === "parlay" && hasSameMatchMultipleBets ? (
                <p className="warning-text">
                  ❌ Οι τρέχουσες επιλογές δεν μπορούν να τοποθετηθούν ως παρολί.
                </p>
              ) : (
                <>
                  {betType === "parlay" && (
                    <div className="total-payout">
                      Συνολικό Κέρδος (Παρολί):{" "}
                      <strong>{calculateParlayPayout()}</strong>
                    </div>
                  )}

                  {betType === "system" && systemBets.length > 0 && (
                    <div className="system-bets">
                      <h3>Περισσότερα Πολλαπλά Επιλογών</h3>
                      {systemBets.map((sys, idx) => (
                        <div key={idx} className="system-option">
                          <span>{sys.name}</span>
                          <span>{sys.odds}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <BetButton bets={bets} betType={betType} onClick={handlePlaceBet} />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BetSlip;
