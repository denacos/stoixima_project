import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SportsMenu from "./SportsMenu";

const Layout = ({ children, onSelectSport }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && <Navbar />}
      {!isLoginPage && (
        <div className="flex flex-col min-h-screen">
          <SportsMenu />

          <div className="flex flex-row flex-1">
            {/* ✅ Sidebar θα υπάρχει ΜΟΝΟ εδώ */}
            <Sidebar onSelectSport={onSelectSport} />
            
            {/* Κύριο περιεχόμενο */}
            <div className="flex-1 p-4">{children}</div>
          </div>
        </div>
      )}
      {isLoginPage && <div className="flex justify-center items-center min-h-screen">{children}</div>}
    </>
  );
};

export default Layout;
