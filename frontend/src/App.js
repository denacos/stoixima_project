import { useState } from "react";
import { useAuth } from "./context/AuthProvider";
import { AuthProvider } from "./context/AuthProvider";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Unauthorized from "./components/Unauthorized";
import UserBets from "./settings/UserBets";
import Transactions from "./settings/Transactions";
import UserSettings from "./settings/UserSettings";
import WalletPage from "./settings/WalletPage";
import Dashboard from "./settings/Dashboard";
import ChatPage from "./settings/ChatPage";
import PreferencesPage from "./settings/PreferencesPage";
import LiveGames from "./sports/LiveGames";
import MatchesPage from "./sports/MatchesPage";
import HomePage from "./sports/HomePage";
import PregamePage from "./sports/PregamePage";
import PregameOddsPage from "./sports/PregameOddsPage"; 
import Casino from "./casino/Casino";
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
