import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../context/axiosInstance";
import { useAuth } from "../context/AuthProvider";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setAuthTokens, setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("token/", {
        username,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refreshToken", refresh);
      setAuthTokens({ access, refresh });

      const userRes = await axios.get("/users/me/");
      const balanceRes = await axios.get("/users/user/balance");
      const updatedUser = { ...userRes.data, balance: balanceRes.data.balance };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(userRes.data));

      navigate("/");
    } catch (err) {
      console.error("Login failed", err);
      setError("Λάθος όνομα χρήστη ή κωδικός.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Σύνδεση</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <label className="block mb-2 text-sm">Όνομα χρήστη</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-2 text-sm">Κωδικός</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Είσοδος
        </button>
      </form>
    </div>
  );
};

export default Login;
