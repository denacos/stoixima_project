import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SportsMenu from "./SportsMenu";

const Layout = ({ children, onSelectSport }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const [activeCategory, setActiveCategory] = useState("sports");

  const handleSelectCategory = (category) => {
    setActiveCategory(category);
    // Αν θέλεις redirect ή άλλο action, μπορείς να το προσθέσεις εδώ
  };

  return (
    <>
      {!isLoginPage && <Navbar />}

      {!isLoginPage && (
        <div className="flex flex-col min-h-screen relative">
          

          {/* ✅ SportsMenu με state και handler */}
          <SportsMenu
            onSelectCategory={handleSelectCategory}
            activeCategory={activeCategory}
          />

          <div className="flex flex-row flex-1">
            <Sidebar onSelectSport={onSelectSport} />
            <div className="flex-1 p-4">{children}</div>
          </div>
        </div>
      )}

      {isLoginPage && (
        <div className="flex justify-center items-center min-h-screen">
          {children}
        </div>
      )}
    </>
  );
};

export default Layout;
