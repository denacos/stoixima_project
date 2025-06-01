import { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";

const CashierBalances = () => {
  const [usersData, setUsersData] = useState([]);
  const [filters, setFilters] = useState({
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [detailsModal, setDetailsModal] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "from_date" && updated.to_date && value > updated.to_date) {
        updated.to_date = value;
      }

      return updated;
    });
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);

      const res = await axios.get(`/users/cashier/balances/?${params.toString()}`);
      setUsersData(res.data);
    } catch (err) {
      console.error("Σφάλμα λήψης δεδομένων:", err);
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (user) => {
    setDetailsModal(user);
  };

  const closeDetailsModal = () => {
    setDetailsModal(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Ταμεία</h2>

      <div className="flex justify-center gap-4 mb-4">
        <input
          type="date"
          name="from_date"
          value={filters.from_date}
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          name="to_date"
          value={filters.to_date}
          onChange={handleFilterChange}
          min={filters.from_date}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Αναζήτηση
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Φόρτωση δεδομένων...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Χρήστης</th>
                <th className="px-4 py-2 border">Πονταρίσματα</th>
                <th className="px-4 py-2 border">Κερδισμένα</th>
                <th className="px-4 py-2 border">Μικτό</th>
                <th className="px-4 py-2 border">Προμήθεια</th>
                <th className="px-4 py-2 border">Οφειλόμενη Προμήθεια</th>
                <th className="px-4 py-2 border">Καθαρό</th>
                <th className="px-4 py-2 border">Λεπτομέρειες</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((user) => (
                <tr key={user.user} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{user.user}</td>
                  <td className="px-4 py-2 border">{user.total_bets}</td>
                  <td className="px-4 py-2 border">{user.total_winnings}</td>
                  <td className="px-4 py-2 border">{user.mixed}</td>
                  <td className="px-4 py-2 border">{user.commission}</td>
                  <td className="px-4 py-2 border">{user.owed_commission}</td>
                  <td className="px-4 py-2 border">{user.net}</td>
                  <td
                    className="px-4 py-2 border cursor-pointer"
                    onClick={() => openDetailsModal(user)}
                  >
                    <span className="text-blue-600">📊</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-center text-blue-600">
              Λεπτομέρειες Στοιχήματος
            </h3>
            <pre className="text-sm text-gray-700">{JSON.stringify(detailsModal, null, 2)}</pre>
            <div className="flex justify-center mt-4">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Κλείσιμο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierBalances;
