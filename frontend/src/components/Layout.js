import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import SportsMenu from "./SportsMenu";
import BetSlip from "../sports/BetSlip";

const Layout = ({ children, onSelectSport }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname.startsWith("/login");
  const [selectedBets, setSelectedBets] = useState([
    {
      id: 1,
      team: 'Πανσερραϊκός',
      market: 'Τελικό Αποτέλεσμα',
      event: 'Πανσερραϊκός vs Λεβαδιακός',
      odds: 1.72,
      stake: '',
    },
    {
      id: 2,
      team: 'Φιορεντίνα',
      market: 'Τελικό Αποτέλεσμα',
      event: 'Φιορεντίνα vs Μίλαν',
      odds: 1.80,
      stake: '',
    },
    {
      id: 3,
      team: 'Μπαρτσελόνα',
      market: 'Τελικό Αποτέλεσμα',
      event: 'Μπαρτσελόνα vs Μπέτις',
      odds: 1.35,
      stake: '',
    },
    {
      id: 4,
      team: 'Παρί Σεν Ζερμέν',
      market: 'Τελικό Αποτέλεσμα',
      event: 'Παρί Σεν Ζερμέν vs Λιόν',
      odds: 1.4,
      stake: '',
    }
  ]);
  

  const [activeCategory, setActiveCategory] = useState(() => {
    if (location.pathname.startsWith("/pregame")) return "sports";
    if (location.pathname === "/casino") return "casino";
    return "live";
  });

  const handleSelectCategory = (category) => {
    setActiveCategory(category);

    if (category === "sports") navigate("/pregame/1");
    else if (category === "live") navigate("/");
    else if (category === "casino") navigate("/casino");
  };

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <>
      <Navbar />

      <div className="flex flex-col min-h-screen relative">
        <SportsMenu
          onSelectCategory={handleSelectCategory}
          activeCategory={activeCategory}
        />

        <div className="flex flex-1">
          <Outlet />
        </div>

        {/* {user && selectedBets.length > 0 && !shouldHideBetslip && (
          <BetSlip selectedBets={selectedBets} setSelectedBets={setSelectedBets} />
        )} */}

        <div className="flex justify-center mt-4">
          <BetSlip selectedBets={selectedBets} setSelectedBets={setSelectedBets} />
        </div>
      </div>
    </>
  );
};

export default Layout;
