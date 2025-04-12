import { useState } from "react";
import axios from "../../context/axiosInstance";
import { useAuth } from "../../context/AuthProvider";
import { Eye, EyeOff } from "lucide-react";

const CashierCreateUser = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    initial_balance: "",
  });

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Οι κωδικοί δεν ταιριάζουν!" });
      return;
    }
  
    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        balance: parseFloat(formData.initial_balance),
        cashier: user.id,
        role: "user",
      };
  
      await axios.post("/users/create/", payload);
  
      setMessage({ type: "success", text: "Ο χρήστης δημιουργήθηκε επιτυχώς!" });
  
      // Ανανεώνουμε το balance στο navbar
      try {
        const res = await axios.get("/users/user/balance");
        const updatedUser = { ...user, balance: res.data.balance };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        console.warn("Αποτυχία ανανέωσης υπολοίπου:", err);
      }
  
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        initial_balance: "",
      });
    } catch (err) {
      console.error(err);

      if (err.response?.data?.error === "Ανεπαρκές υπόλοιπο ταμία.") {
        setMessage({
          type: "error",
          text: "Ο ταμίας δεν διαθέτει επαρκές υπόλοιπο για τη μεταφορά.",
        });
        return;
      }

      const text = err.response?.data?.detail || "Σφάλμα κατά τη δημιουργία χρήστη.";
      setMessage({ type: "error", text });
        }
  };
  

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded mt-6">
      <h2 className="text-xl font-bold mb-4 text-center">Δημιουργία Χρήστη</h2>

      {message && (
        <div
          className={`mb-4 p-2 rounded text-sm text-center ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Όνομα Χρήστη" name="username" value={formData.username} onChange={handleChange} />
        <Input label="Αρχικό Υπόλοιπο (€)" name="initial_balance" value={formData.initial_balance} onChange={handleChange} type="number" step="0.01" />
        <PasswordInput label="Κωδικός" name="password" value={formData.password} onChange={handleChange} />
        <PasswordInput label="Επιβεβαίωση Κωδικού" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
        

        <div className="sm:col-span-2 mt-4">
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
          >
            Δημιουργία Χρήστη
          </button>
        </div>
      </form>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      {...props}
      className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
    />
  </div>
);

const PasswordInput = ({ label, name, value, onChange }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <span
        className="absolute right-3 top-[36px] text-gray-500 cursor-pointer"
        onMouseDown={() => setVisible(true)}
        onMouseUp={() => setVisible(false)}
        onMouseLeave={() => setVisible(false)}
      >
        {visible ? <Eye size={18} /> : <EyeOff size={18} />}
      </span>
    </div>
  );
};

export default CashierCreateUser;
