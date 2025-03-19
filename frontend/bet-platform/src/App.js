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
import LiveGames from "./pages/LiveGames"; // ✅ Προσθήκη της σελίδας Αγώνων σε Εξέλιξη
import Casino from "./pages/Casino";
import LeaguesPage from "./pages/LeaguesPage";
import MatchesPage from "./pages/MatchesPage";
import MatchDetails from "./pages/MatchDetails";
import BetSlip from "./components/BetSlip";
import "./styles/GlobalStyles.css";

const App = () => {
  const [bets, setBets] = useState([]);
  const [isBetSlipOpen, setBetSlipOpen] = useState(false);

  // ✅ Συνάρτηση για προσθήκη στοιχήματος
  const addBet = (bet) => {
    setBets([...bets, bet]);
    setBetSlipOpen(true);
  };

  // ✅ Συνάρτηση για αφαίρεση στοιχήματος
  const removeBet = (index) => {
    setBets(bets.filter((_, i) => i !== index));
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ✅ Περνάμε το addBet στο AuthenticatedRoutes */}
          <Route path="/*" element={<AuthenticatedRoutes addBet={addBet} />} />
        </Routes>

        {/* ✅ Εμφάνιση του BetSlip με τα τρέχοντα στοιχήματα */}
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

// ✅ Ενημερωμένο AuthenticatedRoutes για να προωθεί το addBet
const AuthenticatedRoutes = ({ addBet }) => {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState(null);

  if (!user) {
    return <Login />;
  }

  return (
    <Layout onSelectSport={setSelectedSport}>
      <div className="main-content">
        {selectedSport ? (
          <LeaguesPage sportKey={selectedSport} addBet={addBet} />
        ) : (
          <h2>Επιλέξτε ένα άθλημα από το sidebar</h2>
        )}
      </div>

      <Routes>
        {/* ✅ Περνάμε το addBet στο MatchesPage */}
        <Route path="/matches/:leagueKey" element={<MatchesPage addBet={addBet} />} />
        <Route path="/match/:matchId" element={<MatchDetails />} />

        {user?.role === "user" && (
          <>
            <Route path="/live-games" element={<LiveGames />} /> {/* ✅ Αγώνες σε εξέλιξη */}
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
