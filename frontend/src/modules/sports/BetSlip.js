import { useState } from 'react';
import { FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

const BetSlip = ({ selectedBets = [], setSelectedBets }) => {
  const [expanded, setExpanded] = useState(false);
  const [amounts, setAmounts] = useState({});
  const [comboAmount, setComboAmount] = useState('');
  const [showMultiples, setShowMultiples] = useState(false);
  const [multipleAmounts, setMultipleAmounts] = useState({});

  const toggleExpand = () => setExpanded((prev) => !prev);
  const toggleMultiples = () => setShowMultiples((prev) => !prev);

  const handleAmountChange = (id, value) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleMultipleChange = (type, value) => {
    setMultipleAmounts((prev) => ({ ...prev, [type]: value }));
  };

  const handleRemove = (id) => {
    setSelectedBets((prev) => prev.filter((bet) => bet.id !== id));
    setAmounts((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const clearAll = () => {
    setSelectedBets([]);
    setAmounts({});
    setComboAmount('');
    setMultipleAmounts({});
  };

  const totalOdds = selectedBets.reduce((acc, bet) => acc * bet.odds, 1);
  const comboReturn = (parseFloat(comboAmount || 0) * totalOdds).toFixed(2);
  const comboLabel = ["Μονά", "Διπλά", "Τριπλά", "Τετραπλά", "Πενταπλά"][selectedBets.length - 1] || `${selectedBets.length}πλά`;

  const getCombinations = (array, r) => {
    const results = [];
    const combine = (start, path) => {
      if (path.length === r) {
        results.push(path);
        return;
      }
      for (let i = start; i < array.length; i++) {
        combine(i + 1, [...path, array[i]]);
      }
    };
    combine(0, []);
    return results;
  };

  const renderMultiples = () => {
    const n = selectedBets.length;
    if (n < 3) return null;

    return (
      <div className="bg-neutral-800 p-3 rounded space-y-2">
        {Array.from({ length: n }, (_, i) => i + 1).map((type) => {
          const label = ["Μονά", "Διπλά", "Τριπλά", "Τετραπλά", "Πενταπλά"][type - 1] || `${type}πλά`;
          const combinations = getCombinations(selectedBets, type);
          const multiplier = combinations.length;
          const amount = parseFloat(multipleAmounts[type] || 0);
          const returns = combinations.reduce((sum, combo) => {
            const oddsProduct = combo.reduce((acc, b) => acc * b.odds, 1);
            return sum + oddsProduct * amount;
          }, 0);

          return (
            <div key={type} className="mb-2">
              <div className="flex justify-between items-center text-green-300 font-semibold mb-1">
                <span>{label}</span>
                <div className="flex items-center gap-2">
                  <span>{multiplier}x</span>
                  <input
                    type="number"
                    placeholder="Ποσό"
                    value={multipleAmounts[type] || ''}
                    onChange={(e) => handleMultipleChange(type, e.target.value)}
                    className="w-24 p-1 bg-neutral-900 text-white border border-gray-600 rounded-md text-right"
                  />
                </div>
              </div>
              {amount > 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Χρέωση: €{(multiplier * amount).toFixed(2)}</span>
                  <span>Επιστρέφει €{returns.toFixed(2)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handlePlaceBet = async () => {
    const hasStake =
      Object.values(amounts).some((v) => parseFloat(v) > 0) ||
      parseFloat(comboAmount) > 0 ||
      Object.values(multipleAmounts).some((v) => parseFloat(v) > 0);

    if (!hasStake) {
      alert('⚠️ Πρέπει να εισάγεις τουλάχιστον ένα ποσό για να συνεχίσεις.');
      return;
    }
    try {
      const payload = [];

      selectedBets.forEach((bet) => {
        const stake = parseFloat(amounts[bet.id] || 0);
        if (stake > 0) {
          payload.push({
            match_id: bet.id,
            choice: bet.team,
            odds: bet.odds,
            stake,
          });
        }
      });

      if (comboAmount && parseFloat(comboAmount) > 0 && selectedBets.length >= 2) {
        const odds = selectedBets.reduce((acc, b) => acc * b.odds, 1);
        payload.push({
          match_id: 0,
          choice: 'combo',
          odds,
          stake: parseFloat(comboAmount),
        });
      }

      const n = selectedBets.length;
      for (let i = 1; i <= n; i++) {
        const amount = parseFloat(multipleAmounts[i] || 0);
        if (amount > 0) {
          const combinations = getCombinations(selectedBets, i);
          combinations.forEach((combo) => {
            const odds = combo.reduce((acc, b) => acc * b.odds, 1);
            payload.push({
              match_id: 0,
              choice: `${i}-fold`,
              odds,
              stake: amount,
            });
          });
        }
      }

      for (const bet of payload) {
        await axiosInstance.post('/users/bets/place/', bet);
      }

      alert(`✅ Τοποθετήθηκαν ${payload.length} δελτία!`);
      clearAll();
    } catch (error) {
      console.error(error);
      alert('❌ Σφάλμα κατά την τοποθέτηση στοιχημάτων.');
    }
  };

  const totalStake =
    Object.values(amounts).reduce((a, b) => a + Number(b || 0), 0) +
    Number(comboAmount || 0) +
    Object.entries(multipleAmounts).reduce((sum, [type, value]) => {
      const combinations = getCombinations(selectedBets, parseInt(type));
      return sum + combinations.length * Number(value || 0);
    }, 0);

  if (selectedBets.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md bg-neutral-900 rounded-t-xl shadow-2xl max-h-[80vh] flex flex-col">
      <div
        className="sticky top-0 bg-neutral-900 px-4 py-2 border-b border-neutral-700 flex justify-between items-center z-10"
        onClick={toggleExpand}
      >
        <h3 className="text-white font-bold text-lg">
          {selectedBets.length} {selectedBets.length === 1 ? 'Επιλογή' : 'Επιλογές'}
        </h3>
        <button className="text-white">
          {expanded ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-3 relative overflow-y-auto flex-1">
          <button
            onClick={clearAll}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
          >
            <FaTimes />
          </button>

          {selectedBets.map((bet) => {
            const amount = amounts[bet.id] || 0;
            const returnAmount = (amount * bet.odds).toFixed(2);
            return (
              <div key={bet.id} className="bg-neutral-800 p-3 rounded relative">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemove(bet.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FaTimes size={12} />
                    </button>
                    <div className="text-green-400 font-bold">{bet.team}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{bet.odds}</span>
                    <input
                      type="number"
                      placeholder="Ποσό"
                      value={amount}
                      onChange={(e) => handleAmountChange(bet.id, e.target.value)}
                      className="w-24 p-1 bg-neutral-900 text-white border border-gray-600 rounded-md text-right"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-300">{bet.market}</div>
                <div className="text-xs text-gray-400 italic">{bet.event}</div>
                {amount > 0 && (
                  <div className="text-sm text-gray-400 mt-1">
                    Επιστρέφει €{returnAmount}
                  </div>
                )}
              </div>
            );
          })}

          {selectedBets.length >= 2 && (
            <div className="bg-neutral-800 p-3 rounded">
              <div className="flex justify-between items-center mb-1 text-green-300 font-semibold">
                <span>{comboLabel}</span>
                <div className="flex items-center gap-2">
                  <span>{totalOdds.toFixed(2)}</span>
                  <input
                    type="number"
                    placeholder="Ποσό"
                    value={comboAmount}
                    onChange={(e) => setComboAmount(e.target.value)}
                    className="w-24 p-1 bg-neutral-900 text-white border border-gray-600 rounded-md text-right"
                  />
                </div>
              </div>
              {comboAmount > 0 && (
                <div className="text-sm text-gray-400 mt-1">
                  Επιστρέφει €{comboReturn}
                </div>
              )}
            </div>
          )}

          {selectedBets.length >= 3 && (
            <div>
              <button
                className="text-sm text-green-400 mb-2 underline"
                onClick={toggleMultiples}
              >
                {showMultiples ? 'Εμφάνιση λιγότερων πολλαπλασίων ▲' : 'Εμφάνιση περισσότερων πολλαπλασίων ▼'}
              </button>
              {showMultiples && renderMultiples()}
            </div>
          )}

          
        </div>
      )}
      <div className="sticky bottom bg-neutral-900 pt-2 pb-2 z-10 shadow-inner">
        <button
          onClick={handlePlaceBet}
          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          Στοιχημάτισε €{totalStake.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default BetSlip;
