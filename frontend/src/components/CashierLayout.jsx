import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BetSlip from "../sports/BetSlip";
import Navbar from "./Navbar";
import SportsMenu from "./SportsMenu";


const CashierLayout = () => {
  const location = useLocation();
  const [selectedBets, setSelectedBets] = useState([
    {
      id: 1,
      team: "Ολυμπιακός",
      market: "Τελικό Αποτέλεσμα",
      event: "Ολυμπιακός vs ΠΑΟΚ",
      odds: 1.85,
      stake: "",
    },
    {
      id: 2,
      team: "ΑΕΚ",
      market: "Over 2.5",
      event: "ΑΕΚ vs Άρης",
      odds: 2.05,
      stake: "",
    },
  ]);

  const [activeCategory, setActiveCategory] = useState(() => {
    if (location.pathname.startsWith("/pregame")) return "sports";
    return "live";
  });

  const handleSelectCategory = (category) => {
    setActiveCategory(category);
  };

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

        <div className="flex justify-center mt-4">
          <BetSlip
            selectedBets={selectedBets}
            setSelectedBets={setSelectedBets}
          />
        </div>
      </div>
    </>
  );
};

export default CashierLayout;
