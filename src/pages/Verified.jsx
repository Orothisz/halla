// src/pages/Verified.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Verified() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000026] text-white">
      {/* Title */}
      <h1 className="text-5xl font-bold tracking-widest mb-10 text-yellow-400">
        Verified
      </h1>

      {/* Login Button */}
      <button
        onClick={() => navigate("/login")}
        className="px-8 py-3 rounded-2xl bg-yellow-400 text-black font-semibold 
                   shadow-lg hover:bg-yellow-300 hover:scale-105 
                   transition-all duration-200 ease-in-out"
      >
        Login
      </button>
    </div>
  );
}
