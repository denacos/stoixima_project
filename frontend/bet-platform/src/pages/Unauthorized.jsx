import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold text-red-600">🚫 Πρόσβαση Απορρίφθηκε!</h1>
      <p className="mt-2">Δεν έχετε τα απαραίτητα δικαιώματα για αυτήν τη σελίδα.</p>
      <Link to="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Επιστροφή στην Αρχική
      </Link>
    </div>
  );
};

export default Unauthorized;
