import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { AuthProvider } from "./AuthProvider";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from "../modules/user/components/Layout";
import CashierLayout from "../modules/cashier/components/CashierLayout";
import Login from "../shared/components/Login";
import Unauthorized from "../shared/components/Unauthorized";

import UserBets from "../modules/user/pages/UserBets";
import UserSettings from "../modules/user/pages/UserSettings";
import WalletPage from "../modules/user/pages/WalletPage";
import Transactions from "../modules/user/pages/Transactions";
import PreferencesPage from "../modules/user/pages/PreferencesPage";
import CashierUsers from "../modules/cashier/pages/CashierUsers";
import CashierCreateUser from "../modules/cashier/pages/CashierCreateUser";
import CashierTransfer from "../modules/cashier/pages/CashierTransfer";
import CashierSettings from "../modules/cashier/pages/CashierSettings";
import CashierBalances from "../modules/cashier/pages/CashierBalances";
import CashierBets from "../modules/cashier/pages/CashierBets";

import LiveGames from "../modules/casino/Casino";
import MatchesPage from"../modules/sports/MatchesPage";
import HomePage from "../modules/sports/HomePage";
import PregamePage from "../modules/sports/PregamePage";
import PregameOddsPage from "../modules/sports/PregameOddsPage";
import Casino from "../modules/casino/Casino";

import "../shared/styles/GlobalStyles.css";

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
      {/* 👤 USER ROUTES */}
      {user.role === "user" && (
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="live-games" element={<LiveGames />} />
          <Route path="casino" element={<Casino />} />
          <Route path="bets" element={<UserBets />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="preferences" element={<PreferencesPage />} />
          {/* <Route path="chat" element={<ChatPage />} /> */}
          <Route path="pregame/:sportId" element={<PregamePage />} />
          <Route path="matches/:leagueKey" element={<MatchesPage addBet={addBet} />} />
          <Route path="pregame-odds/:matchId" element={<PregameOddsPage />} />
        </Route>
      )}

      {/* 👨‍💼 CASHIER ROUTES */}
      {user?.role === "cashier" && (
        <Route element={<CashierLayout />}>
          <Route index element={<HomePage />} />
          <Route path="live-games" element={<LiveGames />} />
          <Route path="matches/:leagueKey" element={<MatchesPage addBet={addBet} />} />
          <Route path="pregame/:sportId" element={<PregamePage />} />
          <Route path="pregame-odds/:matchId" element={<PregameOddsPage />} />
          
          {/* Cashier-only routes μέσα από dropdown */}
          <Route path="cashier/users" element={<CashierUsers />} />
          <Route path="cashier/create-user" element={<CashierCreateUser />} />
          <Route path="cashier/transfer" element={<CashierTransfer />} />
          <Route path="cashier/settings" element={<CashierSettings />} />
          <Route path="cashier/balances" element={<CashierBalances />} />
          <Route path="cashier/bets" element={<CashierBets />} />
          {/*
          <Route path="cashier/chat" element={<CashierChat />} />
          
           */}
        </Route>
      )}

      {/* 🛠️ ADMIN ROUTES */}
      {user.role === "admin" && (
        <>
          {/* <Route path="/admin-panel" element={<Dashboard />} />
          <Route path="/manage-users" element={<Dashboard />} />
          <Route path="/financial-reports" element={<Dashboard />} /> */}
        </>
      )}
    </Routes>
  );
};

export default App;
