import { useEffect, useState } from "react";
import axios from "../../context/axiosInstance";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";

const CashierUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { user, setUser } = useAuth();

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
      await axios.delete(`/users/delete/${selectedUser.id}/`);
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      alert("Ο χρήστης διαγράφηκε επιτυχώς.");

      try {
        const res = await axios.get("/users/user/balance");
        const updatedUser = { ...user, balance: res.data.balance };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        console.warn("Αποτυχία ανανέωσης υπολοίπου.");
      }
    } catch (err) {
      console.error("Σφάλμα διαγραφής:", err);
      alert("Αποτυχία διαγραφής.");
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Και τα δύο πεδία είναι υποχρεωτικά.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Οι κωδικοί δεν ταιριάζουν.");
      return;
    }
    const confirmed = window.confirm("Είστε σίγουρος/η ότι θέλετε να αλλάξετε τον κωδικό πρόσβασης;");
    if (!confirmed) return;
    try {
      await axios.post(`/auth/change-password-of/${selectedUser.id}/`, {
        new_password: newPassword,
      });
      alert("Ο κωδικός ενημερώθηκε επιτυχώς.");
      setShowEditModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά την αλλαγή κωδικού.");
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
                  <td className="px-4 py-2 border">{u.date_joined}</td>
                  <td className="px-4 py-2 border">{u.balance?.toFixed(2).replace(".", ",") || "0,00"}</td>
                  <td className="px-4 py-2 border flex justify-center gap-2">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(u)}>
                      <Pencil size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => {
                        setSelectedUser(u);
                        setShowDeleteModal(true);
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

      {showDeleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-md w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">Επιβεβαίωση Διαγραφής</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <p className="text-sm text-gray-700 text-center mb-4">
              Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτόν τον χρήστη;
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
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

      {showEditModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-md w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-600">
                Αλλαγή Κωδικού Πρόσβασης
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Νέος Κωδικός</label>
            <div className="relative mb-3">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded pr-10"
              />
              <span
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </span>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Επιβεβαίωση Κωδικού</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded mb-4"
            />

            <button
              onClick={handlePasswordChange}
              className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
            >
              Αλλαγή Κωδικού Πρόσβασης
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierUsers;
