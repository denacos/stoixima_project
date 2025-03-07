import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const user = useAuthStore((state) => state.user);

    // 🔹 Αυτόματη μεταφορά στο Dashboard αν ο χρήστης είναι ήδη συνδεδεμένος
    useEffect(() => {
        if (user) {
            console.log("User authenticated! Redirecting to Dashboard...");
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        const result = await login(username, password);
        console.log("Login Response:", result);

        if (result.success) {
            console.log("Redirecting to Dashboard...");
            navigate("/dashboard");
        } else {
            setError(result.message);
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
                    />
                    <input
                        type="password"
                        placeholder="Κωδικός"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                    />
                    <button className="w-full bg-blue-500 text-white p-2 rounded">Σύνδεση</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
