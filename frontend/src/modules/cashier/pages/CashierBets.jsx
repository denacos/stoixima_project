import { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { useAuth } from "../../../app/AuthProvider";

const CashierBets = () => {
  const today = new Date().toISOString().split("T")[0];
  const { user } = useAuth();

  const [bets, setBets] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    from_date: today,
    to_date: today,
    status: "",
    type: "",
    user_id: "",
    bet_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 50;

  const paginatedBets = bets.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(bets.length / perPage);

  const totalStake = bets.reduce((sum, b) => sum + (b.stake || 0), 0);
  const totalWinnings = bets.reduce((sum, b) => sum + (b.status === "won" ? b.potential_payout : 0), 0);

  const summary = {
    totalBets: bets.length,
    totalStake: totalStake.toFixed(2),
    totalWinnings: totalWinnings.toFixed(2),
    totalProfit: (totalWinnings - totalStake).toFixed(2),
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/users/cashier/users/");
        setUsers(res.data);
      } catch (err) {
        console.error("Σφάλμα φόρτωσης χρηστών:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "from_date" && value > prev.to_date ? { to_date: value } : {}),
    }));
  };

  const fetchBets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`/users/cashier/user-bets/?${params}`);
      setBets(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Σφάλμα κατά τη λήψη στοιχημάτων:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-xl font-bold text-center mb-4">Στοιχήματα Χρηστών</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <input type="date" name="from_date" value={filters.from_date} onChange={handleFilterChange} className="border px-3 py-2 rounded" />
        <input type="date" name="to_date" value={filters.to_date} min={filters.from_date} onChange={handleFilterChange} className="border px-3 py-2 rounded" />

        <select name="status" value={filters.status} onChange={handleFilterChange} className="border px-3 py-2 rounded">
          <option value="">Κατάσταση</option>
          <option value="open">Ανοιχτό</option>
          <option value="won">Κερδισμένο</option>
          <option value="lost">Χαμένο</option>
          <option value="cashed_out">Cashout</option>
        </select>

        <select name="type" value={filters.type} onChange={handleFilterChange} className="border px-3 py-2 rounded">
          <option value="">Τύπος</option>
          <option value="single">Μονό</option>
          <option value="combo">Παρολί</option>
          <option value="system">Σύστημα</option>
        </select>

        <select name="user_id" value={filters.user_id} onChange={handleFilterChange} className="border px-3 py-2 rounded">
          <option value="">Όλοι οι χρήστες</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>

        <input type="text" name="bet_id" value={filters.bet_id} onChange={handleFilterChange} placeholder="Bet ID" className="border px-3 py-2 rounded" />
      </div>

      <div className="text-center mb-4">
        <button onClick={fetchBets} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Αναζήτηση
        </button>
      </div>

      {/* 🔢 Σύνοψη */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-center font-medium text-gray-800 mb-4">
        <div className="bg-gray-100 py-2 rounded shadow">Σύνολο στοιχημάτων: {summary.totalBets}</div>
        <div className="bg-gray-100 py-2 rounded shadow">Σύνολο πονταρίσματος: € {summary.totalStake}</div>
        <div className="bg-gray-100 py-2 rounded shadow">Σύνολο κερδών: € {summary.totalWinnings}</div>
        <div className="bg-gray-100 py-2 rounded shadow">Συνολικό ταμείο: € {summary.totalProfit}</div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Φόρτωση...</p>
      ) : bets.length === 0 ? (
        <p className="text-center text-gray-500">Δεν βρέθηκαν στοιχήματα.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Χρήστης</th>
                <th className="px-4 py-2 border">Τύπος</th>
                <th className="px-4 py-2 border">Ποντάρισμα</th>
                <th className="px-4 py-2 border">Απόδοση</th>
                <th className="px-4 py-2 border">Πιθ. Κέρδος</th>
                <th className="px-4 py-2 border">Κατάσταση</th>
                <th className="px-4 py-2 border">Παίχτηκε</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBets.map((bet) => (
                <tr key={bet.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{bet.id}</td>
                  <td className="px-4 py-2 border">{bet.user}</td>
                  <td className="px-4 py-2 border capitalize">{bet.type}</td>
                  <td className="px-4 py-2 border">{bet.stake}</td>
                  <td className="px-4 py-2 border">{Number(bet.odds).toFixed(2)}</td>
                  <td className="px-4 py-2 border">{Number(bet.potential_payout).toFixed(2)}</td>
                  <td className="px-4 py-2 border capitalize">{bet.status}</td>
                  <td className="px-4 py-2 border">{new Date(bet.created_at).toLocaleString("el-GR")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded border ${
                    page === currentPage ? "bg-green-700 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CashierBets;