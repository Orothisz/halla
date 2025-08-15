import { Link } from "react-router-dom";

export default function Admin() {
  // Placeholder guarded page (we’ll wire auth later)
  return (
    <div className="min-h-screen text-white bg-[#000026]">
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">Noir MUN — Admin</div>
        <Link to="/" className="text-sm underline">← Back to Home</Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-white/15 p-5 bg-white/[0.05]">
          <h2 className="font-semibold">Announcements</h2>
          <p className="text-sm text-white/70 mt-1">Create, edit, and publish homepage notices.</p>
          <button className="mt-3 px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20">
            Open (coming soon)
          </button>
        </section>

        <section className="rounded-2xl border border-white/15 p-5 bg-white/[0.05]">
          <h2 className="font-semibold">Ticker & Flags</h2>
          <p className="text-sm text-white/70 mt-1">Toggle simulated live ticker & crisis skin.</p>
          <button className="mt-3 px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20">
            Open (coming soon)
          </button>
        </section>

        <section className="rounded-2xl border border-white/15 p-5 bg-white/[0.05]">
          <h2 className="font-semibold">Assistance Content</h2>
          <p className="text-sm text-white/70 mt-1">Edit WILT’s knowledge base & ROP simulator.</p>
          <button className="mt-3 px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20">
            Open (coming soon)
          </button>
        </section>

        <section className="rounded-2xl border border-white/15 p-5 bg-white/[0.05]">
          <h2 className="font-semibold">Inquiries</h2>
          <p className="text-sm text-white/70 mt-1">Review “Talk to us” messages.</p>
          <button className="mt-3 px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20">
            Open (coming soon)
          </button>
        </section>
      </main>
    </div>
  );
}
