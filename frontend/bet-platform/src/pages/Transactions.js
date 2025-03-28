import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");
  const username = JSON.parse(localStorage.getItem("user"))?.username;

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setFromDate(`${yyyy}-${mm}-${dd}T00:00`);
    setToDate(`${yyyy}-${mm}-${dd}T23:59`);
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get("http://127.0.0.1:8000/api/users/transactions/history/", config);
      const all = response.data.history || [];

      const from = new Date(fromDate);
      const to = new Date(toDate);

      const filtered = all.filter((tx) => {
        const txTime = new Date(tx.timestamp);
        const matchDate = txTime >= from && txTime <= to;

        const matchType =
          typeFilter === ""
            ? true
            : typeFilter === "deposit"
            ? tx.receiver === username
            : tx.sender === username;

        return matchDate && matchType;
      });

      setTransactions(filtered);
    } catch (err) {
      setError("Σφάλμα κατά την ανάκτηση των μεταφορών.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="bg-white rounded-lg shadow p-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Ιστορικό Συναλλαγών</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Από:</label>
            <input
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Έως:</label>
            <input
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Τύπος:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Όλα</option>
              <option value="deposit">Κατάθεση</option>
              <option value="withdraw">Ανάληψη</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={handleSearch}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Αναζήτηση
          </button>
        </div>

        {loading && <p className="text-gray-500">Φόρτωση συναλλαγών...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <p className="text-sm font-medium mt-4">
          Σύνολο: {transactions.length} συναλλαγές | Ποσό: {totalAmount.toFixed(2)}€
        </p>

        <table className="w-full border mt-2 text-sm">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Αποστολέας</th>
              <th className="p-2 border">Παραλήπτης</th>
              <th className="p-2 border">Ποσό</th>
              <th className="p-2 border">Ημερομηνία</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border">{tx.sender}</td>
                <td className="p-2 border">{tx.receiver}</td>
                <td className="p-2 border">{tx.amount}€</td>
                <td className="p-2 border">{tx.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
