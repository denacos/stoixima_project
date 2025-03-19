const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());

const API_URL = "https://api.the-odds-api.com/v4";
const API_KEY = process.env.REACT_APP_ODDS_API_KEY;

app.get("/api/sports", async (req, res) => {
    try {
        const response = await fetch(`${API_URL}/sports`, {
            headers: { "x-api-key": API_KEY }
        });

        // Έλεγχος αν το API επιστρέφει επιτυχώς δεδομένα
        if (!response.ok) {
            const errorText = await response.text(); 
            console.error("❌ API ERROR:", errorText);
            return res.status(response.status).json({ error: "API Error", details: errorText });
        }

        const data = await response.json();
        
        // Αν το API επιστρέφει κάτι που δεν είναι array, επιστρέφουμε σφάλμα
        if (!Array.isArray(data)) {
            console.error("❌ API returned unexpected data:", data);
            return res.status(500).json({ error: "Invalid API response", data });
        }

        res.json(data);
    } catch (error) {
        console.error("❌ Server Error:", error.message);
        res.status(500).json({ error: "Server Error", details: error.message });
    }
});

app.listen(5000, () => console.log("✅ Proxy Server running on port 5000"));
