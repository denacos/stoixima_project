import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login, user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            console.log("✅ Ο χρήστης είναι συνδεδεμένος:", user);
            navigate("/");;
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
    
        try {
            const response = await fetch("http://127.0.0.1:8000/api/users/token/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
    
            if (!response.ok) {
                throw new Error("❌ Λάθος στοιχεία! Δοκιμάστε ξανά.");
            }
    
            const data = await response.json();
            console.log("🔹 API Response:", data); // ✅ Δες αν επιστρέφει σωστά δεδομένα
    
            if (!data.access || !data.refresh) {
                throw new Error("❌ Το API δεν επέστρεψε σωστά τα tokens.");
            }
    
            // ✅ Αποθήκευση tokens & χρήστη με σωστά ονόματα
            localStorage.setItem("access", data.access);  // 🟢 Σωστό key για axiosInstance
            localStorage.setItem("refreshToken", data.refresh);
            localStorage.setItem("user", JSON.stringify(data.user || { username }));
    
            login(data.user || { username }, data.access, data.refresh);
            navigate("/");
        } catch (error) {
            console.error("Σφάλμα κατά τη σύνδεση:", error);
            setError(error.message || "❌ Σφάλμα σύνδεσης. Δοκιμάστε ξανά.");
        }
    };
    

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Σύνδεση</h2>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Όνομα χρήστη"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        id="username"
                        name="username"
                    />
                    <input
                        type="password"
                        placeholder="Κωδικός"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                        id="password"
                        name="password"
                    />
                    <button className="w-full bg-blue-500 text-white p-2 rounded">Σύνδεση</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
