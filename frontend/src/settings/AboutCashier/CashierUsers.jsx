import { useEffect, useState } from "react";
import axios from "../../context/axiosInstance";
import { Pencil, Trash2 } from "lucide-react";

const CashierUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users/cashier/users/");
      setUsers(res.data);
      console.log(res.data)
    } catch (err) {
      console.error("Σφάλμα κατά την ανάκτηση χρηστών:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Φόρτωση χρηστών...</div>;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl w-full">
        <h2 className="text-xl font-bold mb-4 text-white">Λίστα Χρηστών</h2>
  
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
                      onClick={() => handleDelete(u.id)}
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
    </div>
  );
  
};

// Placeholder handlers
const handleEdit = (userId) => {
  alert("Επεξεργασία χρήστη ID: " + userId);
};

const handleDelete = (userId) => {
  const confirmDelete = window.confirm("Είσαι σίγουρος για τη διαγραφή;");
  if (confirmDelete) {
    alert("Διαγραφή χρήστη ID: " + userId);
    // Axios DELETE θα προστεθεί εδώ
  }
};

export default CashierUsers;
