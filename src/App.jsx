// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Assistance from "./pages/Assistance.jsx";
import Legal from "./pages/Legal.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

import Admin from "./pages/Admin.jsx";
import Adminv1 from "./pages/Adminv1.jsx";      // NEW
import Verified from "./pages/Verified.jsx";   // NEW

import BestMunDelhi from "./pages/BestMunDelhi.jsx";
import Register from "./pages/Register.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RedirectIfAuthed from "./components/RedirectIfAuthed.jsx";

// (Optional) only if your guard redirects to /403
import Forbidden from "./pages/Forbidden.jsx";  // safe to keep

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/assistance" element={<Assistance />} />
      <Route path="/legal" element={<Legal />} />

      {/* SEO page */}
      <Route path="/best-mun-delhi-faridabad" element={<BestMunDelhi />} />

      {/* Registration */}
      <Route path="/register" element={<Register />} />

      {/* Verified page (public) */}
      <Route path="/verified" element={<Verified />} />

      {/* Auth pages (hide if already logged in) */}
      <Route
        path="/login"
        element={
          <RedirectIfAuthed to="/admin">
            <Login />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthed to="/admin">
            <Signup />
          </RedirectIfAuthed>
        }
      />

      {/* Admin (existing) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />

      {/* Admin v1 (NEW, same guard) */}
      <Route
        path="/adminv1"
        element={
          <ProtectedRoute>
            <Adminv1 />
          </ProtectedRoute>
        }
      />

      {/* Optional: forbidden page if your guard uses it */}
      <Route path="/403" element={<Forbidden />} />

      {/* keep this LAST */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
