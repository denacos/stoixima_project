import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FinancialReports from "./pages/FinancialReports";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ Βεβαιώσου ότι υπάρχει!
import ManageUsers from "./pages/ManageUsers";
import ManageCashiers from "./pages/ManageCashiers";
import ManageBets from "./pages/ManageBets";
import CashierPanel from "./pages/CashierPanel";
import TransactionHistory from "./pages/TransactionHistory";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute allowedRoles={["admin", "boss", "manager"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin", "boss"]} />}>
          <Route path="/manage-users" element={<ManageUsers />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["cashier"]} />}>
          <Route path="/cashier" element={<CashierPanel />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user/history" element={<h1>Ιστορικό Χρήστη</h1>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["cashier", "user"]} />}>
          <Route path="/manage-bets" element={<ManageBets />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/manage-cashiers" element={<ManageCashiers />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["manager", "boss", "admin"]} />}>
          <Route path="/financial-reports" element={<FinancialReports />} />
        </Route>

        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/admin-panel" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
