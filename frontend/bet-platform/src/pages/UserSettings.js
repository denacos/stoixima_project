import React, { useEffect, useState } from "react";

const UserSettings = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/users/me/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Αποτυχία λήψης δεδομένων χρήστη.");
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Σφάλμα φόρτωσης χρήστη:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  return (
    <div className="flex justify-center w-full px-4 py-6">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 text-black">
        <h2 className="text-xl font-semibold mb-4">👤 Λογαριασμός Χρήστη</h2>

        {loading ? (
          <p className="text-gray-500">Φόρτωση...</p>
        ) : userData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-600 font-medium">ID</label>
              <div className="border p-2 rounded bg-gray-50">{userData.id}</div>
            </div>
            <div>
              <label className="text-gray-600 font-medium">Όνομα Χρήστη</label>
              <div className="border p-2 rounded bg-gray-50">{userData.username}</div>
            </div>
            <div>
              <label className="text-gray-600 font-medium">Email</label>
              <div className="border p-2 rounded bg-gray-50">{userData.email || "-"}</div>
            </div>
            <div>
              <label className="text-gray-600 font-medium">Ρόλος</label>
              <div className="border p-2 rounded bg-gray-50">{userData.role}</div>
            </div>
          </div>
        ) : (
          <p className="text-red-600">❌ Δεν βρέθηκαν δεδομένα χρήστη.</p>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
