import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem("access_token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                const response = await axios.get("http://127.0.0.1:8000/api/users/transactions/history/", config);
                setTransactions(response.data.history);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };
        fetchTransactions();
    }, []);

    return (
        <div>
            <h2>Ιστορικό Συναλλαγών</h2>
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

export default TransactionHistory;
