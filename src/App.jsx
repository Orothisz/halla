import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Assistance from "./pages/Assistance.jsx";
import Legal from "./pages/Legal.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/assistance" element={<Assistance />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
