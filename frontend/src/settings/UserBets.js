import React, { useState } from "react";
import axios from "../context/axiosInstance";

const UserBets = () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const defaultFrom = `${today}T00:00`;
  const defaultTo = `${today}T23:59`;

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [status, setStatus] = useState('');
  const [betId, setBetId] = useState('');
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({ total: 0, in: 0, out: 0 });

  const isBetIdValid = betId === '' || /^\d+$/.test(betId);

  const handleSearch = async () => {
    if (!isBetIdValid) return;
    setLoading(true);
    setError('');

    const params = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    if (status) params.status = status;
    if (betId) params.bet_id = betId;

    try {
      const response = await axios.get('/users/user/bets/', { params });
      const data = response.data;
      setBets(data);

      const total = data.length;
      const totalIn = data.reduce((sum, b) => sum + Number(b.stake || 0), 0);
      const totalOut = data.reduce((sum, b) => sum + (b.status === 'won' ? Number(b.odds * b.stake || 0) : 0), 0);

      setStats({ total, in: totalIn, out: totalOut });
    } catch (err) {
      console.error(err);
      setError('Σφάλμα στη φόρτωση των στοιχημάτων.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (s) => {
    switch (s) {
      case 'won': return 'Κερδισμένο';
      case 'lost': return 'Χαμένο';
      case 'open': return 'Τρέχων';
      case 'cancelled': return 'Ακυρωμένο';
      case 'cashed_out': return 'Cash-out';
      case 'pending': return 'Αναμονή';
      case 'refunded': return 'Επιστροφή';
      default: return s;
    }
  };

  const getCircleColor = (status) => {
    if (status === 'open') return 'bg-red-500';
    if (status === 'pending') return 'bg-gray-400';
    return 'bg-green-500';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">Στοιχήματα</h2>

      <div className="grid md:grid-cols-5 gap-4 items-end mb-6">
        <div>
          <label>Από:</label>
          <input type="date" value={fromDate.split('T')[0]} onChange={(e) => {
            const newFrom = `${e.target.value}T00:00:00`;
            setFromDate(newFrom);
            const fromOnly = e.target.value;
            const toOnly = toDate.split('T')[0];
            if (fromOnly > toOnly) {
              setToDate(`${fromOnly}T23:59:59`);
            }
          }} className="w-full p-2 rounded bg-neutral-800 border border-gray-600" />
        </div>
        <div>
          <label>Έως:</label>
          <input type="date" value={toDate.split('T')[0]} min={fromDate.split('T')[0]} onChange={(e) => setToDate(`${e.target.value}T23:59:59`)} className="w-full p-2 rounded bg-neutral-800 border border-gray-600" />
        </div>
        <div>
          <label>Κατάσταση:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 rounded bg-neutral-800 border border-gray-600">
            <option value="">Όλες</option>
            <option value="open">Τρέχων</option>
            <option value="won">Κερδισμένο</option>
            <option value="lost">Χαμένο</option>
            <option value="cancelled">Ακυρωμένο</option>
            <option value="cashed_out">Cash-out</option>
            <option value="pending">Αναμονή</option>
            <option value="refunded">Επιστροφή</option>
          </select>
        </div>
        <div>
          <label>Bet ID:</label>
          <input 
            type="text"
            value={betId} 
            onChange={(e) => setBetId(e.target.value)}
             className={`w-full p-2 rounded border ${isBetIdValid ? 'bg-neutral-800 border-gray-600' : 'bg-neutral-800 border-red-500'}`} />
        </div>
        <div>
          <button 
            onClick={handleSearch} 
            disabled={!isBetIdValid}
            className={`w-full py-2 px-4 rounded ${!isBetIdValid ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
              Αναζήτηση
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-300 space-y-1 mb-4">
        <p>Σύνολο στοιχημάτων: <strong>{stats.total}</strong></p>
        <p>Σύνολο πονταρίσματος: <strong>{stats.in.toFixed(2)} €</strong></p>
        <p>Σύνολο κερδών: <strong>{stats.out.toFixed(2)} €</strong></p>
        <p>Συνολικό ταμείο: <strong>{(stats.out - stats.in).toFixed(2)} €</strong></p>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && bets.length > 0 && (
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-neutral-800">
            <tr>
              <th className="p-2 border border-gray-700">ID</th>
              <th className="p-2 border border-gray-700">Κατάσταση</th>
              <th className="p-2 border border-gray-700">Ποντάρισμα</th>
              <th className="p-2 border border-gray-700">Κέρδη</th>
              <th className="p-2 border border-gray-700">Πιθανά Κέρδη</th>
              <th className="p-2 border border-gray-700">Τύπος</th>
              <th className="p-2 border border-gray-700">Κλεισμένο</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr key={bet.id} className="border border-gray-700">
                <td className="p-2">{bet.id}</td>
                <td className="p-2">{getStatusLabel(bet.status)}</td>
                <td className="p-2">{bet.stake.toFixed(2)} €</td>
                <td className="p-2">{bet.status === 'won' ? (bet.stake * bet.odds).toFixed(2) + ' €' : '0.00 €'}</td>
                <td className="p-2">{(bet.stake * bet.odds).toFixed(2)} €</td>
                <td className="p-2">{bet.choice === 'combo' || bet.choice?.includes('-fold') ? 'Παρολί' : 'Απλό'}</td>
                <td className="p-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${getCircleColor(bet.status)}`}></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && bets.length === 0 && <p className="text-gray-400">Δεν βρέθηκαν αποτελέσματα.</p>}
    </div>
  );
};

export default UserBets;