import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthProvider";
import BetButton from "./BetButton";
import "./BetSlip.css";

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

  const calculateSystemPayout = useCallback((numSelections) => {
    const subsetOdds = bets.slice(0, numSelections).reduce((acc, bet) => acc * bet.odds, 1);
    return (subsetOdds * 10).toFixed(2);
  }, [bets]);

  useEffect(() => {
    if (betType === "system") {
      const newSystems = [];
      for (let i = 2; i <= bets.length; i++) {
        newSystems.push({ name: `${i} Επιλογές`, odds: calculateSystemPayout(i), stake: "" });
      }
      setSystemBets(newSystems);
    }
  }, [bets, betType, calculateSystemPayout]);

  const calculateParlayPayout = () => {
    const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
    return (totalOdds * (bets[0]?.stake || 1)).toFixed(2);
  };

  const handleStakeChange = (index, newStake) => {
    const updatedBets = [...bets];
    updatedBets[index].stake = newStake;
    setBets(updatedBets);
  };

  return (
    <div className={`betslip-container ${isMinimized ? "minimized" : "open"}`}>
      <div className="betslip-header" onClick={() => setIsMinimized(!isMinimized)}>
        <h2>Επιλογές</h2>
        <span className="toggle-btn">{isMinimized ? "⬆" : "⬇"}</span>
      </div>

      {!isMinimized && (
        <div className="betslip-body">
          <div className="bet-type-selection">
            <button onClick={() => setBetType("single")} className={betType === "single" ? "active" : ""}>
              Μονά
            </button>
            <button onClick={() => setBetType("parlay")} className={betType === "parlay" ? "active" : ""}>
              Παρολί
            </button>
            <button onClick={() => setBetType("system")} className={betType === "system" ? "active" : ""}>
              Σύστημα
            </button>
          </div>

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
                      onChange={(e) => handleStakeChange(index, parseFloat(e.target.value) || "")}
                    />
                  </div>
                  <button className="remove-bet" onClick={() => removeBet(index)}>✖</button>
                </div>
              ))
            )}
          </div>

          {bets.length > 0 && (
            <div className="betslip-footer">
              {betType === "parlay" && (
                <div className="total-payout">
                  Συνολικό Κέρδος (Παρολί): <strong>{calculateParlayPayout()}</strong>
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
              <BetButton bets={bets} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BetSlip;
