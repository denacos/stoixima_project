// import useAuthStore from "../store/authStore";
// import { useNavigate } from "react-router-dom";
// import { useEffect, useCallback } from "react";

// const Dashboard = () => {
//   const { user, checkAuth, logout } = useAuthStore();
//   const navigate = useNavigate();

//   // ✅ Χρησιμοποιούμε useCallback για να αποτρέψουμε επανεκτελέσεις στο useEffect
//   const verifyAuth = useCallback(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     verifyAuth();
//   }, [verifyAuth]);  // ✅ Προστέθηκε σωστά στο dependency array

//   const handleLogout = () => {
//     logout();
//     navigate("/");
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-2xl font-bold">Dashboard</h1>

//       {user ? (
//         <div className="mt-4 text-center">
//           <p className="text-lg">
//             Καλώς ήρθες, <strong>{user.username}</strong>!
//           </p>
//           <p className="text-sm text-gray-600">
//             Ρόλος: <strong>{user.role || "Άγνωστος"}</strong>
//           </p>
//         </div>
//       ) : (
//         <p className="text-red-500 mt-4">Δεν υπάρχουν στοιχεία χρήστη.</p>
//       )}

//       <button
//         onClick={handleLogout}
//         className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
//       >
//         Logout
//       </button>
//     </div>
//   );
// };

// export default Dashboard;
