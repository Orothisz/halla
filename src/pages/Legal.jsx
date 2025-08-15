import { Link } from "react-router-dom";

const TERMS_SHORT = `NOIR MODEL UNITED NATIONS — TERMS & PRIVACY (Short)
By using this site or registering for Noir MUN, you agree to basic event terms: appropriate conduct, non-refundable fees, and reasonable use of your data for operations and updates. Decisions by the Organising Committee and EB are final. For details or clarifications, write to allotments.noirmun@gmail.com.`;

export default function Legal() {
  return (
    <div className="min-h-screen text-white">
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur">
        <strong>Legal — Noir MUN</strong>
        <Link to="/" className="rounded-xl border border-white/20 px-3 py-2">Home</Link>
      </header>
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold">Terms & Privacy</h1>
        <pre className="mt-3 whitespace-pre-wrap text-white/80 text-sm leading-relaxed">
{TERMS_SHORT}
        </pre>
      </main>
    </div>
  );
}
