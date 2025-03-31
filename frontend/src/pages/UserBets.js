import React, { useState, useEffect } from "react";

const UserBets = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");
  const [betId, setBetId] = useState("");
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const from = `${yyyy}-${mm}-${dd}T00:00`;
    const to = `${yyyy}-${mm}-${dd}T23:59`;

    setFromDate(from);
    setToDate(to);
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.append("from_date", fromDate.split("T")[0]);
    params.append("to_date", toDate.split("T")[0]);
    if (status) params.append("status", status);
    if (betId) params.append("bet_id", betId);

    try {
      const response = await fetch(
        `http://localhost:8000/api/users/user/bets/?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Σφάλμα κατά την ανάκτηση των στοιχημάτων.");
      }

      const data = await response.json();
      setBets(data);
    } catch (err) {
      setError(err.message || "Αποτυχία σύνδεσης.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full px-4 py-6">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 text-black">
        <h2 className="text-xl font-semibold mb-4">Στοιχήματα</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Από:</label>
            <input
              type="datetime-local"
              className="w-full border rounded p-2"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Έως:</label>
            <input
              type="datetime-local"
              className="w-full border rounded p-2"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Κατάσταση:</label>
            <select
              className="w-full border rounded p-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Όλες</option>
              <option value="running">Τρέχον</option>
              <option value="won">Κερδισμένο</option>
              <option value="lost">Χαμένο</option>
              <option value="cashed_out">Cashout</option>
              <option value="cancelled">Ακυρωμένο</option>
              <option value="pending">Αναμονή επιβεβαίωσης</option>
              <option value="refunded">Επιστροφή</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Bet ID:</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={betId}
              onChange={(e) => setBetId(e.target.value)}
              placeholder="π.χ. 1234"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Αναζήτηση
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-500">Φόρτωση στοιχημάτων...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {bets.length > 0 ? (
          <table className="w-full border mt-4 text-sm">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2 border">Ημερομηνία</th>
                <th className="p-2 border">Αγώνας</th>
                <th className="p-2 border">Ποντάρισμα</th>
                <th className="p-2 border">Κατάσταση</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{bet.date}</td>
                  <td className="p-2 border">{bet.match_name || bet.match || "Αγώνας"}</td>
                  <td className="p-2 border">{bet.stake}€</td>
                  <td className="p-2 border">{bet.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && <p className="text-gray-500 mt-4">Δεν βρέθηκαν στοιχήματα.</p>
        )}
      </div>
    </div>
  );
};

export default UserBets;
