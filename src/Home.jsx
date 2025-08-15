import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { REGISTER_URL, WHATSAPP_ESCALATE } from "../shared/constants";
import { Link } from "react-router-dom";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thread, setThread] = useState([
    { from: "bot", text: "Hey! I’m Noir — ask dates, fee, venue, founders, committees… or say ‘executive’." },
  ]);
  const add = (m) => setThread((t) => [...t, m]);

  const send = () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    add({ from: "user", text: msg });

    const q = msg.toLowerCase();
    if (/date|when/.test(q)) return add({ from: "bot", text: "Dates: 11–12 October, 2025." });
    if (/fee|price|cost/.test(q)) return add({ from: "bot", text: "Delegate fee: ₹2300." });
    if (/venue|where|location/.test(q)) return add({ from: "bot", text: "Venue: TBA — want WhatsApp updates when we announce?" });
    if (/founder|organiser|organizer|oc|eb/.test(q))
      return add({ from: "bot", text: "Leadership — Founder: Sameer Jhamb, Co-Founder: Maahir Gulati, President: Gautam Khera." });
    if (/committee|agenda|topic/.test(q))
      return add({ from: "bot", text: "Open Assistance for full briefs → /assistance" });
    if (/register|sign/.test(q))
      return add({ from: "bot", text: "Open Linktree → " + REGISTER_URL });
    if (/exec|human|someone|whatsapp/.test(q)) {
      window.open(WHATSAPP_ESCALATE, "_blank");
      return add({ from: "bot", text: "Opening WhatsApp…" });
    }
    return add({ from: "bot", text: "Try: dates • fee • venue • founders • committees • register • executive" });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="w-96 max-w-[92vw] rounded-2xl shadow-2xl overflow-hidden border border-white/15 backdrop-blur bg-white/10 text-white"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-white/10">
              <div className="font-semibold">Talk to us</div>
              <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80"><X size={18} /></button>
            </div>

            <div className="max-h-96 overflow-auto p-3 space-y-3">
              {thread.map((m, i) => (
                <div key={i} className={`flex ${m.from === "bot" ? "justify-start" : "justify-end"}`}>
                  <div className={`${m.from === "bot" ? "bg-white/20" : "bg-white/30"} text-sm px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-2">
              <button onClick={() => setInput("Dates?") || send()} className="text-xs rounded-full px-3 py-1 bg-white/15">Dates</button>
              <button onClick={() => setInput("Fee?") || send()} className="text-xs rounded-full px-3 py-1 bg-white/15">Fee</button>
              <button onClick={() => setInput("Venue?") || send()} className="text-xs rounded-full px-3 py-1 bg-white/15">Venue</button>
              <button onClick={() => setInput("Founders?") || send()} className="text-xs rounded-full px-3 py-1 bg-white/15">Founders</button>
              <Link to="/assistance" className="text-xs rounded-full px-3 py-1 bg-white/15">Open Assistance</Link>
            </div>

            <div className="p-3 flex items-center gap-2">
              <input
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything…"
                className="flex-1 bg-white/15 px-3 py-2 rounded-xl outline-none placeholder-white/60"
              />
              <button onClick={send} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ y: -2 }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white shadow-xl bg-[--theme] border border-white/20 hover:shadow-2xl"
          style={{ "--theme": "#000026" }}
        >
          <MessageCircle size={18} /> Talk to us
        </motion.button>
      )}
    </div>
  );
}
