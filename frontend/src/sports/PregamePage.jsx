// PregamePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFutbol, FaBasketballBall, FaVolleyballBall, FaTableTennis,
  FaFootballBall, FaRunning, FaSwimmer, FaSkiing, FaBiking, FaDice
} from "react-icons/fa";
import axiosInstance from "../context/axiosInstance";

const sports = {
  "1": { name: "Ποδόσφαιρο", icon: <FaFutbol /> },
  "18": { name: "Μπάσκετ", icon: <FaBasketballBall /> },
  "13": { name: "Τένις", icon: <FaTableTennis /> },
  "91": { name: "Βόλεϊ", icon: <FaVolleyballBall /> },
  "78": { name: "Χάντμπολ", icon: <FaRunning /> },
  "16": { name: "Μπέιζμπολ", icon: <FaFootballBall /> },
  "2": { name: "Ιπποδρομίες", icon: <FaBiking /> },
  "4": { name: "Γκρίζα σκυλιά", icon: <FaDice /> },
  "17": { name: "Χόκεϊ πάγου", icon: <FaSkiing /> },
  "14": { name: "Σνούκερ", icon: <FaRunning /> },
  "12": { name: "Αμερικανικό Ποδόσφαιρο", icon: <FaFootballBall /> },
  "3": { name: "Κρίκετ", icon: <FaRunning /> },
  "83": { name: "Φούτσαλ", icon: <FaBasketballBall /> },
  "15": { name: "Νταρτς", icon: <FaDice /> },
  "92": { name: "Πινγκ Πονγκ", icon: <FaTableTennis /> },
  "94": { name: "Μπάντμιντον", icon: <FaVolleyballBall /> },
  "8": { name: "Ράγκμπι Ένωσης", icon: <FaRunning /> },
  "19": { name: "Ράγκμπι Λιγκ", icon: <FaRunning /> },
  "36": { name: "Αυστραλιανός Κανόνες", icon: <FaBiking /> },
  "66": { name: "Μπόουλινγκ", icon: <FaDice /> },
  "9": { name: "Πυγμαχία", icon: <FaRunning /> },
  "75": { name: "Γαελικά Αθλήματα", icon: <FaRunning /> },
  "90": { name: "Φλόρμπολ", icon: <FaRunning /> },
  "95": { name: "Παραλία Βόλεϊ", icon: <FaVolleyballBall /> },
  "110": { name: "Υδατοσφαίριση", icon: <FaSwimmer /> },
  "107": { name: "Σκουός", icon: <FaSkiing /> },
  "151": { name: "E-sports", icon: <FaDice /> },
  "162": { name: "MMA", icon: <FaRunning /> },
  "148": { name: "Surfing", icon: <FaBiking /> }
};

const PregamePage = () => {
  const [selectedSport, setSelectedSport] = useState("1");
  const [competitions, setCompetitions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompetitions(selectedSport);
  }, [selectedSport]);

  const fetchCompetitions = async (sportId) => {
    try {
      const res = await axiosInstance.get(`/pregame-matches/${sportId}/`);
      setCompetitions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error loading competitions:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-200 p-4 overflow-y-auto max-h-screen">
        <h2 className="text-base font-medium mb-4">Αθλήματα</h2>
        <ul className="space-y-2">
          {Object.entries(sports).map(([id, sport]) => (
            <li
              key={id}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-green-800 ${selectedSport === id ? "bg-green-700" : ""}`}
              onClick={() => {
                setSelectedSport(id);
                navigate(`/pregame/${id}`);
              }}
            >
              <span className="text-xl">{sport.icon}</span>
              <span>{sport.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Κεντρικό περιεχόμενο + δεξιά στήλη */}
      <div className="flex flex-1 overflow-y-auto">
        {/* Κεντρικό */}
        <div className="flex-grow bg-gray-200 p-6 rounded-lg shadow-md m-4">
          <h2 className="text-xl font-bold mb-4">Διοργανώσεις - {sports[selectedSport].name}</h2>
          {competitions.length === 0 ? (
            <p>⏳ Φόρτωση...</p>
          ) : (
            <ul className="space-y-2">
              {competitions.map((comp) => (
                <li key={comp.id}>
                  <a
                    href={`/pregame/${comp.id}`}
                    className="text-green-400 hover:underline"
                  >
                    {comp.league.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Δεξιά στήλη */}
        <div className="w-80 p-6 rounded-lg shadow-md m-4">
          <h3 className="text-lg font-semibold mb-2">Πληροφορίες</h3>
          <p className="text-sm text-gray-300">[Εδώ μπορεί να μπουν banners, στατιστικά ή promo]</p>
        </div>
      </div>
    </div>
  );
};

export default PregamePage;
