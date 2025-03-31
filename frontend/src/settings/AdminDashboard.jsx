import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("access_token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                const usersResponse = await axios.get("http://127.0.0.1:8000/api/users/list/", config);
                const transactionsResponse = await axios.get("http://127.0.0.1:8000/api/users/transactions/history/", config);

                setUsers(usersResponse.data);
                setTransactions(transactionsResponse.data.history);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <h3>Χρήστες</h3>
            <ul>
                {users.map(user => (
                    <li key={user.username}>{user.username} - {user.role}</li>
                ))}
            </ul>
            <h3>Συναλλαγές</h3>
            <table>
                <thead>
                    <tr>
                        <th>Αποστολέας</th>
                        <th>Παραλήπτης</th>
                        <th>Ποσό</th>
                        <th>Ημερομηνία</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx, index) => (
                        <tr key={index}>
                            <td>{tx.sender}</td>
                            <td>{tx.receiver}</td>
                            <td>{tx.amount}</td>
                            <td>{tx.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
