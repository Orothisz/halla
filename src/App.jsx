import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Assistance from "./pages/Assistance.jsx";
import Legal from "./pages/Legal.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Admin from "./pages/Admin.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RedirectIfAuthed from "./components/RedirectIfAuthed.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/assistance" element={<Assistance />} />
      <Route path="/legal" element={<Legal />} />

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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
