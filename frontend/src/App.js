import { useState } from "react";
import { useAuth } from "./context/AuthProvider";
import { AuthProvider } from "./context/AuthProvider";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";
import UserBets from "./pages/UserBets";
import Transactions from "./pages/Transactions";
import UserSettings from "./pages/UserSettings";
import LiveGames from "./pages/LiveGames";
import Casino from "./pages/Casino";
import MatchesPage from "./pages/MatchesPage";
import HomePage from "./pages/HomePage"; // ✅ Προσθήκη HomePage
import PregamePage from "./pages/PregamePage";
import PregameOddsPage from "./pages/PregameOddsPage"; // ✅ Νέα σελίδα για αποδόσεις
import WalletPage from "./pages/WalletPage";
import PreferencesPage from "./pages/PreferencesPage";
import ChatPage from "./pages/ChatPage";
import "./styles/GlobalStyles.css";


const App = () => {
  const [bets, setBets] = useState([]);

  const addBet = (bet) => {
    setBets([...bets, bet]);
  };

  const removeBet = (index) => {
    setBets(bets.filter((_, i) => i !== index));
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* 🛡️ Protected Routes */}
          <Route path="/*" element={<PrivateRoutes addBet={addBet} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const PrivateRoutes = ({ addBet }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Routes>
      {/* Layout που τυλίγει τις εσωτερικές σελίδες */}
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/pregame/:sportId" element={<PregamePage />} />
        <Route path="/matches/:leagueKey" element={<MatchesPage addBet={addBet} />} />
        <Route path="/pregame-odds/:matchId" element={<PregameOddsPage />} />

        {user?.role === "user" && (
          <>
            <Route path="/live-games" element={<LiveGames />} />
            <Route path="/casino" element={<Casino />} />
            <Route path="/bets" element={<UserBets />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </>
        )}

        {user?.role === "cashier" && <Route path="/cashier" element={<Dashboard />} />}
        {user?.role === "admin" && (
          <>
            <Route path="/admin-panel" element={<Dashboard />} />
            <Route path="/manage-users" element={<Dashboard />} />
            <Route path="/financial-reports" element={<Dashboard />} />
          </>
        )}
      </Route>
    </Routes>
  );
};

export default App;
