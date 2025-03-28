import React, { useEffect, useState } from "react";
import axios from "axios";

const sportIcons = {
  "Soccer": "⚽",
  "Basketball": "🏀",
  "Tennis": "🎾",
  "Volleyball": "🏐",
  "Ice Hockey": "🏒",
  "Baseball": "⚾",
  "American Football": "🏈",
  "Cricket": "🏏",
  "eSports": "🎮",
  "Boxing": "🥊",
  "Handball": "🤾",
};

const HomePage = () => {
  const [liveData, setLiveData] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/live-matches-structured/");
        setLiveData(res.data);
        if (res.data.length > 0) {
          setSelectedSport(res.data[0].sport); // default to first sport
        }
      } catch (err) {
        console.error("Failed to fetch live matches:", err);
      }
    };
    fetchData();
  }, []);

  const sports = Array.from(new Set(liveData.map(g => g.sport)));
  const filtered = liveData.filter(g => g.sport === selectedSport);

  return (
    <div className="p-4 bg-[#111] text-white min-h-screen">
      {/* Sport selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-4 py-1 rounded-full text-sm font-medium border ${
              selectedSport === sport ? "bg-green-600 text-white" : "bg-gray-800 text-gray-300"
            }`}
          >
            {sportIcons[sport] || "🎯"} {sport}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400">Δεν υπάρχουν αγώνες.</p>
      ) : (
        filtered.map((group, idx) => (
          <div key={idx} className="mb-8">
            <div className="text-green-400 text-sm font-semibold mb-2 border-b border-gray-700 pb-1">
              {group.league}
            </div>
            <table className="w-full text-sm text-center">
              <thead className="text-gray-400">
                <tr>
                  <th className="py-1">Ομάδες</th>
                  <th>Σκορ</th>
                  <th>Χρόνος</th>
                  <th>1</th>
                  <th>X</th>
                  <th>2</th>
                </tr>
              </thead>
              <tbody>
                {group.matches.map((match, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-800 hover:bg-gray-900 transition"
                  >
                    <td className="py-1">{match.home_team} vs {match.away_team}</td>
                    <td>{match.score}</td>
                    <td>{match.time}</td>
                    <td className="text-yellow-400">{match.odds["1"]}</td>
                    <td className="text-yellow-400">{match.odds["X"]}</td>
                    <td className="text-yellow-400">{match.odds["2"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default HomePage;

