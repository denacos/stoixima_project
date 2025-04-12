import React, { useState } from "react";
import axios from "../../context/axiosInstance";


const PreferencesPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sessionDuration, setSessionDuration] = useState("3h");

  const token = localStorage.getItem("access") || localStorage.getItem("authToken");

  const handlePasswordChange = async () => {
    try {
      const response = await axios.post("/users/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      
      setMessage(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Σφάλμα αλλαγής κωδικού");
      setMessage("");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ρυθμίσεις</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Password */}
        <div>
          <h2 className="text-lg font-semibold mb-2">🔒 Αλλαγή κωδικού πρόσβασης</h2>
          <input
            type="password"
            placeholder="Τρέχων κωδικός πρόσβασης"
            className="w-full p-2 mb-2 border"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Νέος κωδικός"
            className="w-full p-2 mb-2 border"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Επιβεβαίωση νέου κωδικού"
            className="w-full p-2 mb-4 border"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handlePasswordChange} className="w-full bg-green-700 text-white p-2 rounded">
            Αλλαγή κωδικού πρόσβασης
          </button>
          {message && <p className="text-green-600 mt-2">{message}</p>}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>

        {/* Session Duration */}
        <div>
          <h2 className="text-lg font-semibold mb-2">⏱ Χρόνος σύνδεσης</h2>
          {[
            { label: "3 ώρες", value: "3h" },
            { label: "6 ώρες", value: "6h" },
            { label: "1 μέρα", value: "1d" },
            { label: "2 μέρες", value: "2d" },
            { label: "3 μέρες", value: "3d" },
          ].map((option) => (
            <div key={option.value}>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value={option.value}
                  checked={sessionDuration === option.value}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  className="mr-2"
                />
                {option.label}
              </label>
            </div>
          ))}
          <button className="mt-4 w-full bg-green-700 text-white p-2 rounded">Αποθήκευση</button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;