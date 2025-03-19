const fetchOdds = async () => {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/odds/all/");
        if (!response.ok) {
            throw new Error("Failed to fetch odds");
        }
        const data = await response.json();
        console.log("📢 Odds Data:", data); // ✅ Για debugging
        return data;
    } catch (error) {
        console.error("❌ Error fetching odds:", error);
        return null;
    }
};

export default fetchOdds;
