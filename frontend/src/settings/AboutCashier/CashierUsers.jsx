import { useEffect, useState } from "react";
import axios from "../../context/axiosInstance";
import { Pencil, Trash2} from "lucide-react";

const CashierUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users/cashier/users/");
      setUsers(res.data);
    } catch (err) {
      console.error("Σφάλμα κατά την ανάκτηση χρηστών:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/users/delete/${selectedUserId}/`);
      setUsers(users.filter((u) => u.id !== selectedUserId));
      setShowModal(false);
    } catch (err) {
      console.error("Σφάλμα διαγραφής:", err);
      alert("Αποτυχία διαγραφής.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Φόρτωση χρηστών...</div>;

  return (
    <div className="mx-auto p-6">
      <div className="mx-auto max-w-5xl w-full">
        <h2 className="text-xl font-bold mb-4 text-white text-center">Λίστα Χρηστών</h2>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm bg-white shadow-sm rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Όνομα</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Ημερομηνία Δημιουργίας</th>
                <th className="px-4 py-2 border">Χρήματα (€)</th>
                <th className="px-4 py-2 border">Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="text-center hover:bg-gray-50">
                  <td className="px-4 py-2 border">{u.id}</td>
                  <td className="px-4 py-2 border">{u.username}</td>
                  <td className="px-4 py-2 border">{u.email}</td>
                  <td className="px-4 py-2 border">{u.date_joined}</td>
                  <td className="px-4 py-2 border">
                    {u.balance?.toFixed(2).replace(".", ",") || "0,00"}
                  </td>
                  <td className="px-4 py-2 border flex justify-center gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(u.id)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setShowModal(true);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-center text-red-600">Επιβεβαίωση Διαγραφής</h3>
            <p className="text-sm text-gray-700 text-center mb-4">
              Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτόν τον χρήστη;
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
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

const handleEdit = (userId) => {
  alert("Επεξεργασία χρήστη ID: " + userId);
};

export default CashierUsers;
