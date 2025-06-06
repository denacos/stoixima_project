import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { AuthProvider } from "./app/AuthProvider";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Ολόκληρη η εφαρμογή περιβάλλεται από το AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA


