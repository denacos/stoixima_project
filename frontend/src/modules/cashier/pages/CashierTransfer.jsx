import { useEffect, useState } from "react";
import { useAuth } from "../../../app/AuthProvider";
import axios from "../../../api/axiosInstance";

const CashierTransfer = () => {
  const today = new Date().toISOString().split("T")[0];

  const { user, setUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    type: "deposit",
    amount: "",
  });
  const [filters, setFilters] = useState({
    from: today,
    to: today,
    type: "",
    user: "",
  });
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const paginatedHistory = history.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(history.length / perPage);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/users/cashier/users/");
        const userList = res.data;

        // Αν υπάρχει manager, πρόσθεσέ τον "εικονικά"
        const managerRes = await axios.get("/users/me/");
        const manager = managerRes.data.manager;
        
        if (manager) {
            userList.unshift({ id: manager.id, username: `Manager: ${manager.username}` });
        }

        setUsers(userList);
      } catch (err) {
        console.error("Σφάλμα χρήστών:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };
  

  const handleFinalSubmit = async () => {
    setMessage(null);
    try {
      const payload = {
        user_id: parseInt(formData.user_id),
        type: formData.type,
        amount: parseFloat(formData.amount),
      };
      const res = await axios.post("/users/cashier/transfer/", payload);
      setMessage({ type: "success", text: res.data.message });
      const resUser = await axios.get("/users/user/balance");
      const updatedUser = { ...user, balance: resUser.data.balance };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setFormData({ user_id: "", type: "deposit", amount: "" });
      setShowConfirmModal(false);
    } catch (err) {
      const text = err.response?.data?.detail || "Σφάλμα κατά τη μεταφορά.";
      console.warn("Δεν ανανεώθηκε το balance στο navbar.");
      setMessage({ type: "error", text });
      setShowConfirmModal(false);
    }
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.type) params.append("type", filters.type);
      if (filters.user) params.append("user", filters.user);
      const res = await axios.get(`/users/cashier/transactions/?${params.toString()}`);
      setHistory(res.data);
      setCurrentPage(1); // reset page on new search
    } catch (err) {
      console.error("Σφάλμα ανάκτησης ιστορικού:", err);
    }
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ΦΟΡΜΑ ΜΕΤΑΦΟΡΑΣ */}
        <div className="bg-white shadow-md rounded p-6 w-full lg:w-1/2">
          <h2 className="text-xl font-bold mb-4 text-center">Μεταφορά Κεφαλαίων</h2>

          {message && (
            <div className={`mb-4 p-2 text-sm rounded text-center ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleConfirmSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Χρήστης</label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              >
                <option value="">-- Επιλέξτε --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Τύπος Μεταφοράς</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              >
                <option value="deposit">Κατάθεση</option>
                <option value="withdraw">Ανάληψη</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ποσό (€)</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
              >
                Εκτέλεση Μεταφοράς
              </button>
            </div>
          </form>
        </div>

        {/* ΙΣΤΟΡΙΚΟ */}
        <div className="bg-white shadow-md rounded p-6 w-full lg:w-[65%] xl:w-[70%]">
          <h2 className="text-xl font-bold mb-4 text-center">Ιστορικό Μεταφορών</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input type="date" name="from" value={filters.from} onChange={handleFilterChange}
              className="border px-3 py-2 rounded" />
            <input type="date" name="to" value={filters.to} onChange={handleFilterChange}
              min={filters.from}
              className="border px-3 py-2 rounded" />
            <select name="type" value={filters.type} onChange={handleFilterChange}
              className="border px-3 py-2 rounded">
              <option value="">Όλοι οι τύποι μεταφοράς</option>
              <option value="deposit">Κατάθεση</option>
              <option value="withdraw">Ανάληψη</option>
            </select>
            <select name="user" value={filters.user} onChange={handleFilterChange}
              className="border px-3 py-2 rounded">
              <option value="">Όλοι οι χρήστες</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <button onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Αναζήτηση
            </button>
          </div>

          {paginatedHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border border-gray-300 bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Ημερομηνία</th>
                    <th className="px-4 py-2 border">Χρήστης</th>
                    <th className="px-4 py-2 border">Τύπος Μεταφοράς </th>
                    <th className="px-4 py-2 border">Ποσό (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-nowrap">{tx.timestamp}</td>
                      <td className="px-4 py-2 border">{tx.user}</td>
                      <td className="px-4 py-2 border">{tx.type === "deposit" ? "Κατάθεση" : "Ανάληψη"}</td>
                      <td className="px-4 py-2 border">{tx.amount.toFixed(2).replace(".", ",")}</td>
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
          ) : (
            <p className="text-sm text-gray-500">Δεν υπάρχουν αποτελέσματα.</p>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded shadow-md p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-red-600 mb-4 text-center">
                Επιβεβαίωση Μεταφοράς
            </h3>
            <p className="text-sm text-gray-700 text-center mb-6">
                Είστε σίγουρος/η ότι θέλετε να μεταφέρετε το ποσό των{" "}
                <strong>€{parseFloat(formData.amount).toFixed(2).replace(".", ",")}</strong> {formData.type === "deposit" ? "στον/ην" : "από τον/ην"} χρήστη{" "}
                <strong>
                {
                    users.find((u) => parseInt(u.id) === parseInt(formData.user_id))?.username || "-"
                }
                </strong>;
            </p>
            <div className="flex justify-center gap-4">
                <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                Ακύρωση
                </button>
                <button
                onClick={handleFinalSubmit}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                >
                Επιβεβαίωση
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default CashierTransfer;
