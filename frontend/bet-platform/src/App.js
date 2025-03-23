import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import MatchDetails from "./pages/MatchDetails";
import BetSlip from "./components/BetSlip";
import HomePage from "./pages/HomePage"; // ✅ Προσθήκη HomePage
import AllMatchesPage from "./pages/AllMatchesPage"; // ✅ Προσθήκη AllMatchesPage
import PregameOddsPage from "./pages/PregameOddsPage"; // ✅ Νέα σελίδα για αποδόσεις
import "./styles/GlobalStyles.css";

const App = () => {
  const [bets, setBets] = useState([]);
  const [isBetSlipOpen, setBetSlipOpen] = useState(false);

  const addBet = (bet) => {
    setBets([...bets, bet]);
    setBetSlipOpen(true);
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
          <Route path="/*" element={<AuthenticatedRoutes addBet={addBet} />} />
        </Routes>

        <BetSlip
          isOpen={isBetSlipOpen}
          onClose={() => setBetSlipOpen(false)}
          betSlip={bets}
          removeBet={removeBet}
        />
      </Router>
    </AuthProvider>
  );
};

const AuthenticatedRoutes = ({ addBet }) => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* ✅ Κάνει το "/" να οδηγεί στο HomePage */}
        <Route path="/all-matches" element={<AllMatchesPage />} /> {/* ✅ Σελίδα για όλους τους pregame αγώνες */}
        <Route path="/matches/:leagueKey" element={<MatchesPage addBet={addBet} />} />
        <Route path="/match/:matchId" element={<MatchDetails />} />
        <Route path="/pregame-odds/:matchId" element={<PregameOddsPage />} /> {/* ✅ Νέα δυναμική διαδρομή */}

        {user?.role === "user" && (
          <>
            <Route path="/live-games" element={<LiveGames />} />
            <Route path="/casino" element={<Casino />} />
            <Route path="/bets" element={<UserBets />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/settings" element={<UserSettings />} />
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
      </Routes>
    </Layout>
  );
};

export default App;
