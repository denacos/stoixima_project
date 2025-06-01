import { useState } from "react";
import axios from "../../../api/axiosInstance";
import { useAuth } from "../../../app/AuthProvider";
import { Eye, EyeOff } from "lucide-react";

const CashierSettings = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Όλα τα πεδία είναι υποχρεωτικά." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Οι νέοι κωδικοί δεν ταιριάζουν." });
      return;
    }

    try {
      await axios.post("/users/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setMessage({ type: "success", text: "Ο κωδικός αλλάχθηκε με επιτυχία." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Σφάλμα κατά την αλλαγή κωδικού.";
      setMessage({ type: "error", text: msg });
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-md rounded flex flex-col lg:flex-row gap-12">
      {/* ΠΡΟΦΙΛ ΧΡΗΣΤΗ */}
      <div className="w-full lg:w-1/2">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Στοιχεία Χρήστη</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
          <div>
            <label className="block text-gray-600">ID</label>
            <input
              type="text"
              value={user.id || ""}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-600">Όνομα</label>
            <input
              type="text"
              value={user.username || ""}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-600">Ρόλος</label>
            <input
              type="text"
              value={user.role || ""}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-600">Υπόλοιπο</label>
            <input
              type="text"
              value={`€${user.balance?.toFixed(2).replace(".", ",")}`}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded"
              readOnly
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-600">Εγγραφή</label>
            <input
              type="text"
              value={user.date_joined || ""}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ */}
      <div className="w-full lg:w-1/2">
        <h2 className="text-xl font-bold mb-4 text-center">Αλλαγή Κωδικού</h2>

        {message && (
          <div className={`mb-4 p-2 rounded text-sm text-center ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Τρέχων Κωδικός</label>
            <input
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Νέος Κωδικός</label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Επιβεβαίωση Κωδικού</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded pr-10"
              />
              <span
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
          >
            Αλλαγή Κωδικού
          </button>
        </form>
      </div>
    </div>
  );
};

export default CashierSettings;
