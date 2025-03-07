import useAuthStore from "../store/authStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CashierPanel = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [cashierUsers, setCashierUsers] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "cashier") {
      navigate("/unauthorized");
    } else {
      fetchCashierUsers();
    }
  }, [user, navigate]);

  const fetchCashierUsers = async () => {
    try {
      const response = await api.get("/cashier/users/");
      setCashierUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Ταμείο</h1>
      <ul className="mt-4">
        {cashierUsers.map((u) => (
          <li key={u.id} className="p-2 border-b">
            {u.username} - {u.balance}€
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CashierPanel;
