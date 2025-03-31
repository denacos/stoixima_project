import { useAuth } from "../../context/AuthProvider";

const BetButton = ({ bets }) => {
  const { token } = useAuth();

  const placeBet = async () => {
    try {
      const response = await fetch("/api/users/bets/place/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bets }),
      });

      if (!response.ok) {
        throw new Error("Αποτυχία υποβολής στοιχήματος.");
      }

      alert("Το στοίχημα καταχωρήθηκε!");
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("Αποτυχία υποβολής στοιχήματος.");
    }
  };

  return (
    <button className="place-bet-btn" onClick={placeBet}>
      Τοποθέτηση Στοιχήματος
    </button>
  );
};

export default BetButton;
