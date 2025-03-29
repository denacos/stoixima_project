import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import PregamePage from '../pages/PregamePage'; // PregamePage component
import SportsMenu from "./SportsMenu";

const Layout = ({ children, onSelectSport }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";
  const isPregamePage = location.pathname.startsWith("/pregame"); // Έλεγχος για PregamePage

  const [activeCategory, setActiveCategory] = useState("live");

  const handleSelectCategory = (category) => {
    setActiveCategory(category);
    if (category === "sports") {
      // Ανακατεύθυνση στη σελίδα Pregame με sportId=1 (Ποδόσφαιρο)
      navigate("/pregame/1"); 
    }
    // Αν θέλεις να προσθέσεις άλλες κατηγορίες, μπορείς να το κάνεις εδώ
  };

  return (
    <>
      {!isLoginPage && <Navbar />}

      {!isLoginPage && (
        <div className="flex flex-col min-h-screen relative">
          {/* SportsMenu με το state και handler */}
          <SportsMenu
            onSelectCategory={handleSelectCategory}
            activeCategory={activeCategory}
          />

          <div className="flex flex-1">
            {/* Sidebar - Θα εμφανίζεται μόνο στην PregamePage */}
            {isPregamePage && <Sidebar selectedSport={1} />}

            {/* Κεντρικό περιεχόμενο */}
            <div className="flex-1 p-5 bg-gray-900 text-white">
              <PregamePage /> {/* Εδώ καλείται το PregamePage */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;
