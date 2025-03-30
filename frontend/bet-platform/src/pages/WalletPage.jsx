import React, { useEffect, useState } from "react";

const WalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [report, setReport] = useState(null);
  const [pendingBets, setPendingBets] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");


  useEffect(() => {
    const fetchWalletData = async () => {
      setLoading(true);
      
      try {
        // setPendingBets([]); // μέσα στο try ή πριν το fetch
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch balance
        const balanceRes = await fetch("http://127.0.0.1:8000/api/users/user/balance/", { headers });
        const balanceData = await balanceRes.json();
        setBalance(balanceData.balance || 0);

        // Fetch report
        const reportRes = await fetch("http://127.0.0.1:8000/api/users/bets/user-report/", { headers });
        const reportData = await reportRes.json();
        setReport(reportData);

        // Fetch pending bets
        const slipRes = await fetch("http://127.0.0.1:8000/api/users/bets/slip/", { headers });
        const slipData = await slipRes.json();
        setPendingBets(slipData);
      } catch (err) {
        console.error("Σφάλμα φόρτωσης πορτοφολιού:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [token]);

  const inAmount = report?.total_bets || 0;
  const outAmount = report?.total_winnings || 0;
  const net = outAmount - inAmount;
  const pendingTotal = Array.isArray(pendingBets)
  ? pendingBets.reduce((sum, b) => sum + (b.stake || 0), 0)
  : 0;


  return (
    <div className="flex justify-center w-full px-4 py-6">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 text-black">
        <h2 className="text-xl font-semibold mb-4">💰 Ταμείο Χρήστη</h2>

        {loading ? (
          <p className="text-gray-500">Φόρτωση...</p>
        ) : (
          <>
            <table className="w-full border text-sm mb-6">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-2 border">Προϊόν</th>
                  <th className="p-2 border">In</th>
                  <th className="p-2 border">Out</th>
                  <th className="p-2 border">Μικτό</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="p-2 border">Sports Totals</td>
                  <td className="p-2 border">{inAmount.toFixed(2)}€</td>
                  <td className="p-2 border">{outAmount.toFixed(2)}€</td>
                  <td className="p-2 border">{net.toFixed(2)}€</td>
                </tr>
                <tr className="font-semibold bg-gray-100">
                  <td className="p-2 border">Σύνολα</td>
                  <td className="p-2 border">{inAmount.toFixed(2)}€</td>
                  <td className="p-2 border">{outAmount.toFixed(2)}€</td>
                  <td className="p-2 border">{net.toFixed(2)}€</td>
                </tr>
              </tbody>
            </table>

            <div className="text-sm text-gray-800 mb-2">
              <strong>Εκκρεμή δελτία:</strong> {pendingBets.length}
            </div>
            <div className="text-sm text-gray-800 mb-4">
              <strong>Σύνολο εκκρεμών In:</strong> {pendingTotal.toFixed(2)}€
            </div>

            <div className="text-sm text-gray-600">
              <strong>Τρέχον υπόλοιπο:</strong> {balance.toFixed(2)}€
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
