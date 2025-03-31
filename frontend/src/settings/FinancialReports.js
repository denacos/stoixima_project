import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

const FinancialReports = () => {
    const { user } = useContext(AuthContext); // ✅ Βεβαιωνόμαστε ότι υπάρχει χρήστης
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // ✅ Παίρνουμε το token από το Context ή το localStorage
                const storedToken = localStorage.getItem("authToken");

                if (!storedToken) {
                    throw new Error("❌ Δεν βρέθηκε authentication token! Ο χρήστης πρέπει να κάνει login.");
                }

                console.log("🔑 Χρησιμοποιώντας Token:", storedToken);

                const response = await fetch("http://127.0.0.1:8000/api/users/financial-reports/", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("❌ Μη εξουσιοδοτημένη πρόσβαση. Ο χρήστης πρέπει να συνδεθεί ξανά.");
                    }
                    throw new Error(`❌ Σφάλμα HTTP: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                console.log("✅ Λήφθηκαν δεδομένα:", data);
                setReports(data);
            } catch (error) {
                console.error("❌ Σφάλμα στη φόρτωση των οικονομικών αναφορών:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) { // ✅ Βεβαιωνόμαστε ότι ο χρήστης είναι συνδεδεμένος
            fetchReports();
        } else {
            console.warn("⚠️ Ο χρήστης δεν είναι συνδεδεμένος. Δεν μπορεί να φορτώσει τις αναφορές.");
            setLoading(false);
        }
    }, [user]);

    return (
        <div>
            {loading ? "Loading..." : reports.length > 0 ? (
                <pre>{JSON.stringify(reports, null, 2)}</pre>
            ) : (
                <p>❌ Δεν υπάρχουν διαθέσιμες οικονομικές αναφορές.</p>
            )}
        </div>
    );
};

export default FinancialReports;
