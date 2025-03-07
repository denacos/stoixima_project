import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized"; // Δημιουργούμε σελίδα μη εξουσιοδοτημένης πρόσβασης
import RoleProtectedRoute from "./components/RoleProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar /> {/* ✅ Προσθήκη του Navbar */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<RoleProtectedRoute allowedRoles={["admin", "boss", "manager"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["admin", "boss"]} />}>
          <Route path="/manage-users" element={<h1>Διαχείριση Χρηστών</h1>} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["cashier"]} />}>
          <Route path="/cashier" element={<h1>Ταμείο</h1>} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user/history" element={<h1>Ιστορικό Χρήστη</h1>} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["admin", "boss", "manager"]} />}>
          <Route path="/manage-users" element={<ManageUsers />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["cashier", "user"]} />}>
          <Route path="/manage-bets" element={<ManageBets />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["cashier"]} />}>
          <Route path="/cashier" element={<CashierPanel />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
