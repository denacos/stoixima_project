import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const BetSlip = ({ selectedBets = [], setSelectedBets }) => {
  const [expanded, setExpanded] = useState(false);
  const [amounts, setAmounts] = useState({});
  const [comboAmount, setComboAmount] = useState('');

  const toggleExpand = () => setExpanded((prev) => !prev);

  const handleAmountChange = (id, value) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
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
  };

  const totalOdds = selectedBets.reduce((acc, bet) => acc * bet.odds, 1);
  const comboReturn = (parseFloat(comboAmount || 0) * totalOdds).toFixed(2);

  const comboLabel = ["Μονά", "Διπλά", "Τριπλά", "Τετραπλά", "Πενταπλά"][selectedBets.length - 1] || `${selectedBets.length}πλά`;

  if (selectedBets.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md bg-neutral-900 rounded-t-xl shadow-2xl">
      <div
        className="flex justify-between items-center px-4 py-2 border-b border-neutral-700 cursor-pointer"
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
        <div className="p-4 space-y-3 relative">
          <button
            onClick={clearAll}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
          >
            <FaTimes />
          </button>

          {selectedBets.map((bet) => (
            <div key={bet.id} className="bg-neutral-800 p-3 rounded relative">
              <button
                onClick={() => handleRemove(bet.id)}
                className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
              >
                <FaTimes size={12} />
              </button>
              <div className="text-green-400 font-bold">{bet.team}</div>
              <div className="text-sm text-gray-300">{bet.market}</div>
              <div className="flex items-center mt-2 gap-2">
                <span className="font-semibold text-white">{bet.odds}</span>
                <input
                  type="number"
                  placeholder="Ποσό"
                  value={amounts[bet.id] || ''}
                  onChange={(e) => handleAmountChange(bet.id, e.target.value)}
                  className="w-24 p-1 bg-neutral-900 text-white border border-gray-600 rounded-md text-right"
                />
              </div>
            </div>
          ))}

          {selectedBets.length >= 2 && (
            <div className="bg-neutral-800 p-3 rounded">
              <div className="flex justify-between items-center mb-1 text-green-300 font-semibold">
                <span>{comboLabel}</span>
                <span>{totalOdds.toFixed(2)}</span>
              </div>
              <input
                type="number"
                placeholder="Ποσό"
                value={comboAmount}
                onChange={(e) => setComboAmount(e.target.value)}
                className="w-full p-1 bg-neutral-900 text-white border border-gray-600 rounded-md text-right"
              />
              {comboAmount && (
                <div className="text-sm text-gray-400 mt-1">
                  Επιστρέφει €{comboReturn}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => alert('🟢 Τοποθέτηση στοιχήματος!')}
            className="w-full mt-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Στοιχημάτισε €{
              (
                Object.values(amounts).reduce((a, b) => a + Number(b || 0), 0) +
                Number(comboAmount || 0)
              ).toFixed(2)
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default BetSlip;
