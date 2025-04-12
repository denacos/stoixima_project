import { useEffect, useState } from "react";
import axios from "../../context/axiosInstance";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const today = new Date().toISOString().split("T")[0];
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user?.id;

  useEffect(() => {
    setFilters({ from: today, to: today, type: "" });
    handleSearch(today, today, "");
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
  
    setFilters((prev) => {
      const updated = { ...prev, [name]: value };
  
      if (name === "from" && updated.to && value > updated.to) {
        updated.to = value; // συγχρονισμός όταν από > έως
      }
  
      return updated;
    });
  };
  

  const handleSearch = async (from = filters.from, to = filters.to, type = filters.type) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      if (type) params.append("type", type);

      const res = await axios.get(`/users/transactions/history/?${params.toString()}`);
      setTransactions(res.data.history);
      setCurrentPage(1);
    } catch (err) {
      console.error("Σφάλμα λήψης συναλλαγών:", err);
    } finally {
      setLoading(false);
    }
  };

  const paginated = transactions.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  const totalPages = Math.ceil(transactions.length / perPage);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Ιστορικό Μεταφορών</h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <input
          type="date"
          name="from"
          value={filters.from}
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          name="to"
          value={filters.to}
          onChange={handleFilterChange}
          min={filters.from}
          className="border px-3 py-2 rounded"
        />
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        >
          <option value="">Όλοι οι τύποι</option>
          <option value="deposit">Καταθέσεις</option>
          <option value="withdraw">Αναλήψεις</option>
        </select>
        <button
          onClick={() => handleSearch()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Αναζήτηση
        </button>
      </div>

      <div className="min-h-[500px] flex flex-col justify-between">
        {loading ? (
          <p className="text-center text-gray-500">Φόρτωση...</p>
        ) : paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm text-left border border-gray-300 bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Ημερομηνία</th>
                    <th className="px-4 py-2 border">Αποστολέας</th>
                    <th className="px-4 py-2 border">Παραλήπτης</th>
                    <th className="px-4 py-2 border">Ποσό (€)</th>
                    <th className="px-4 py-2 border">Τύπος Μεταφοράς</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{tx.timestamp}</td>
                      <td className="px-4 py-2 border">{tx.sender}</td>
                      <td className="px-4 py-2 border">{tx.receiver}</td>
                      <td className="px-4 py-2 border">
                        {tx.amount.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-4 py-2 border">
                        {tx.type === "deposit" ? "Ανάληψη" : "Κατάθεση"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-gray-500">Δεν βρέθηκαν αποτελέσματα.</p>
        )}

        {/* Σταθερό Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded border ${
                  page === currentPage
                    ? "bg-green-700 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
