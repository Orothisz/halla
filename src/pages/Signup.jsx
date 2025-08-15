import { useState } from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen text-white bg-[#000026] grid place-items-center px-4">
      <div className="w-full max-w-md border border-white/15 rounded-2xl p-6 bg-white/[0.05]">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-white/70 text-sm mt-1">Join the Noir MUN community.</p>
        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Full name"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 border border-white/20">
            Continue
          </button>
        </div>
        <div className="text-sm text-white/70 mt-4">
          Already have an account? <Link to="/login" className="underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
