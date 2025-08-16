import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Assistance from "./pages/Assistance.jsx";
import Legal from "./pages/Legal.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Admin from "./pages/Admin.jsx";
import BestMunDelhi from "./pages/BestMunDelhi.jsx";

// NEW: your register page
import Register from "./pages/Register.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RedirectIfAuthed from "./components/RedirectIfAuthed.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/assistance" element={<Assistance />} />
      <Route path="/legal" element={<Legal />} />

      {/* SEO magnet page */}
      <Route
        path="/best-mun-delhi-faridabad"
        element={<BestMunDelhi />}
      />

      {/* NEW registration page */}
      <Route path="/register" element={<Register />} />

      {/* If already signed in, don’t show login/signup */}
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

      {/* /admin is protected */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />

      {/* keep this LAST */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
