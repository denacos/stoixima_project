// Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFutbol, FaBasketballBall, FaVolleyballBall, FaTableTennis, FaFootballBall, FaRunning, FaSwimmer, FaSkiing, FaBiking, FaDice, FaThList } from "react-icons/fa";

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

const Sidebar = ({ selectedSport }) => {
  const [competitions, setCompetitions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedSport) {
      fetchCompetitions(selectedSport);
    }
  }, [selectedSport]);

  const fetchCompetitions = async (sportId) => {
    try {
      const token = localStorage.getItem("access");
      const response = await fetch(`http://127.0.0.1:8000/api/pregame-matches/${sportId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCompetitions(data);
    } catch (error) {
      console.error("Error fetching competitions:", error);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-5 flex flex-col">
      <div className="text-2xl mb-6 text-center">
        <FaThList className="inline-block mr-2" /> ΠΛΗΡΗΣ ΛΙΣΤΑ
      </div>
      <ul className="space-y-6">
        {Object.keys(sports).map((sportId) => (
          <li
            key={sportId}
            className="flex items-center space-x-4 cursor-pointer hover:bg-green-800 p-2 rounded-lg"
            onClick={() => { fetchCompetitions(sportId); navigate(`/pregame/${sportId}`); }}
          >
            <span className="text-xl">{sports[sportId].icon}</span>
            <span className="text-lg">{sports[sportId].name}</span>
          </li>
        ))}
      </ul>

      {competitions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Διοργανώσεις:</h3>
          <ul className="space-y-3">
            {competitions.map((competition) => (
              <li key={competition.id}>
                <a
                  href={`/pregame/${competition.id}`}
                  className="text-green-400 hover:text-white"
                >
                  {competition.league.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
