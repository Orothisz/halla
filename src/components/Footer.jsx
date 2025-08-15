import { Link } from "react-router-dom";
import { LOGO_URL, REGISTER_URL } from "../shared/constants";
import { ChevronRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-3 text-white/80">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Noir" className="h-10 w-10 object-contain" />
          <div>
            <div className="font-semibold">Noir MUN</div>
            <div className="text-xs text-white/60">Faridabad, India</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Explore</div>
          <Link to="/assistance" className="block text-sm hover:underline">Assistance</Link>
          <a href={REGISTER_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm hover:underline">
            Register <ChevronRight size={14} />
          </a>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Legal</div>
          <Link to="/legal" className="block text-sm hover:underline">Terms & Privacy</Link>
          <div className="text-xs text-white/60">© {new Date().getFullYear()} Noir MUN — “Whispers Today, Echo Tomorrow.”</div>
        </div>
      </div>
    </footer>
  );
}
