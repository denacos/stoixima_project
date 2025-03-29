// PregamePage.jsx
import React, { useEffect, useState } from "react";

const PregamePage = () => {
  const [competitions, setCompetitions] = useState([]);
  const sportId = 1; // Προεπιλογή το ποδόσφαιρο

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await fetch(`http://127.0.0.1:8000/api/pregame-matches/${sportId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setCompetitions(data);
        } else {
          console.error("Η απόκριση δεν είναι πίνακας:", data);
        }
      } catch (error) {
        console.error("Error fetching competitions:", error);
      }
    };

    fetchCompetitions();
  }, [sportId]);

  return (
    <div className="flex justify-center py-10 px-4 bg-gray-900 min-h-screen">
      <div className="flex gap-10">
        {/* Κεντρική περιοχή αποτελεσμάτων */}
        <div className="w-2/3 bg-gray-800 text-white p-5 rounded-lg shadow-lg">
          <h2 className="text-2xl mb-4">Διοργανώσεις για το Σπορ: Ποδόσφαιρο</h2>
          <div className="space-y-3">
            {competitions.length === 0 ? (
              <p>⏳ Φόρτωση διοργανώσεων...</p>
            ) : (
              <ul>
                {competitions.map((competition) => (
                  <li key={competition.id}>
                    <a href={`/pregame/${competition.id}`} className="text-green-400 hover:text-white">
                      {competition.league.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Στήλη για μελλοντικές πληροφορίες */}
        <div className="w-1/3 bg-gray-800 text-white p-5 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Περισσότερες Πληροφορίες</h3>
          <p className="mt-2">Εδώ θα μπουν περισσότερες πληροφορίες αργότερα.</p>
        </div>
      </div>
    </div>
  );
};

export default PregamePage;
