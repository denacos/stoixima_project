import useAuthStore from "../store/authStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ManageUsers = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user || !["admin", "boss", "manager"].includes(user.role)) {
      navigate("/unauthorized");
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Διαχείριση Χρηστών</h1>
      <ul className="mt-4">
        {users.map((u) => (
          <li key={u.id} className="p-2 border-b">
            {u.username} - {u.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUsers;
