import useAuthStore from "../store/authStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ManageBets = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bets, setBets] = useState([]);

  useEffect(() => {
    if (!user || !["cashier", "user"].includes(user.role)) {
      navigate("/unauthorized");
    } else {
      fetchBets();
    }
  }, [user, navigate]);

  const fetchBets = async () => {
    try {
      const response = await api.get("/bets/");
      setBets(response.data);
    } catch (error) {
      console.error("Error fetching bets:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Ιστορικό Στοιχημάτων</h1>
      <ul className="mt-4">
        {bets.map((bet) => (
          <li key={bet.id} className="p-2 border-b">
            {bet.user} - {bet.amount}€ - {bet.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageBets;
