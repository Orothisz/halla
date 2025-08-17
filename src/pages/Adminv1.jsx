// src/pages/Adminv1.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Search, Loader2, BadgeCheck, AlertCircle, Clock3, RefreshCw,
} from "lucide-react";
import { LOGO_URL } from "../shared/constants";
import { supabase } from "../lib/supabase";

/* ---------- Background EXACTLY like Home.jsx ---------- */
function NoirBgExact() {
  return (
    <>
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(1200px_800px_at_80%_-20%,rgba(255,255,255,0.08),rgba(0,0,0,0)),radial-gradient(1000px_600px_at_10%_20%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
      <div
        className="fixed inset-0 -z-10 opacity-[.06] pointer-events-none"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.12%22/></svg>')",
        }}
      />
    </>
  );
}

/* ---------- Helpers ---------- */
const cls = (...xs) => xs.filter(Boolean).join(" ");
const STATUS = ["pending", "verified", "rejected"];
const title = s => s[0].toUpperCase() + s.slice(1);

/* ---------- Premium headless select ---------- */
function FancySelect({ value, onChange, options, className = "" }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const current = options.find(o => o.value === value) || options[0];
  return (
    <div ref={box} className={"relative " + className}>
      <button
        type="button"
        className="w-full justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 outline-none inline-flex items-center gap-2"
        onClick={() => setOpen(v => !v)}
      >
        <span className="truncate">{current?.label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" className={open ? "rotate-180 transition" : "transition"}>
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl max-h-64 overflow-auto">
          {options.map((o) => (
            <button
              key={o.value}
              className={"w-full text-left px-3 py-2 hover:bg-white/10 " + (o.value === value ? "bg-white/10" : "")}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Page ---------- */
export default function Adminv1() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);               // from DA PRIVATE
  const [committees, setCommittees] = useState([]);   // derived
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [committee, setCommittee] = useState("all");
  const [source, setSource] = useState("all");        // (kept for future multi-sources)

  // KPI (from DelCount; fallback to computed)
  const [kpi, setKpi] = useState({ total: 0, paid: 0, unpaid: 0 });
  const [breakdown, setBreakdown] = useState([]); // [{name,total,paid,unpaid}]

  // ---- fetch both sheets ----
  useEffect(() => { fetchAll(); }, []);
  async function fetchAll() {
    setLoading(true);
    try {
      const DA_URL  = import.meta.env.VITE_DAPRIVATE_JSON_URL?.trim();
      const DC_URL  = import.meta.env.VITE_DELCOUNT_JSON_URL?.trim();

      // 1) DA PRIVATE (rows)
      if (DA_URL) {
        const res = await fetch(DA_URL, { cache: "no-store" });
        const json = await res.json();
        const data = Array.isArray(json?.rows) ? json.rows : [];
        // normalize payment_status values
        const norm = data.map((r, i) => ({
          id: r.id ?? i + 1,
          full_name: r.full_name ?? r.name ?? "",
          email: r.email ?? "",
          phone: r.phone ?? r["phone no."] ?? "",
          alt_phone: r.alt_phone ?? r.alternate ?? "",
          committee_pref1: r.committee_pref1 ?? r.committee ?? "",
          portfolio_pref1: r.portfolio_pref1 ?? r.portfolio ?? "",
          mail_sent: r.mail_sent ?? "",
          payment_status: (r.payment_status || "pending").toLowerCase(),
          source: "DA PRIVATE"
        }));
        setRows(norm);

        // derive committees list
        const setC = new Set();
        norm.forEach((r) => { if (r.committee_pref1) setC.add(r.committee_pref1); });
        setCommittees(Array.from(setC).sort());

        // fallback KPI from DA PRIVATE if DelCount missing
        if (!DC_URL) {
          const total = norm.length;
          const paid = norm.filter(r => r.payment_status === "verified").length;
          const unpaid = norm.filter(r => r.payment_status === "pending").length;
          setKpi({ total, paid, unpaid });
        }
      }

      // 2) DelCount (totals + breakdown)
      if (DC_URL) {
        const res = await fetch(DC_URL, { cache: "no-store" });
        const json = await res.json();
        const totals = json?.totals || {};
        const committees = json?.committees || {};

        const t = totals.delegates || totals.total || totals.responses || 0;
        const paid = totals.paid || 0;
        const unpaid = totals.unpaid || Math.max(0, t - paid);
        setKpi({ total: t, paid, unpaid });

        const bd = Object.keys(committees).map((name) => ({
          name,
          total: committees[name].total || 0,
          paid: committees[name].paid || 0,
          unpaid: committees[name].unpaid || 0
        }));
        setBreakdown(bd);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ---- filters ----
  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter(r => {
      const hit = !qq ||
        (r.full_name || "").toLowerCase().includes(qq) ||
        (r.email || "").toLowerCase().includes(qq) ||
        (r.phone || "").toLowerCase().includes(qq) ||
        (r.committee_pref1 || "").toLowerCase().includes(qq) ||
        (r.portfolio_pref1 || "").toLowerCase().includes(qq);
      const passStatus = status === "all" ? true : (r.payment_status || "pending") === status;
      const passCommittee = committee === "all" ? true :
        (r.committee_pref1 || "").toLowerCase() === committee.toLowerCase();
      const passSource = source === "all" ? true : (r.source || "DA PRIVATE") === source;
      return hit && passStatus && passCommittee && passSource;
    });
  }, [rows, q, status, committee, source]);

  function exportCSV() {
    const headers = ["id","full_name","email","phone","alt_phone","committee_pref1","portfolio_pref1","mail_sent","payment_status","source"];
    const csv = [
      headers.join(","),
      ...visible.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `delegates_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative min-h-[100dvh] text-white">
      <NoirBgExact />

      {/* Topbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Noir" className="h-8 w-8 rounded-lg ring-1 ring-white/10" />
            <div>
              <div className="text-base font-semibold">Admin • Registrations</div>
              <div className="text-xs opacity-70">Noir MUN — Operational Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2">
              <RefreshCw size={16}/> Refresh
            </button>
            <button onClick={exportCSV} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2">
              <Download size={16}/> Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-5">
        {/* KPIs from DelCount (or fallback) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
          <KPI title="Total" value={kpi.total} tone="from-white/15 to-white/5" icon={<BadgeCheck size={18}/>}/>
          <KPI title="Pending" value={Math.max(0, kpi.total - kpi.paid - kpi.unpaid)} tone="from-yellow-500/25 to-yellow-500/10" icon={<Clock3 size={18}/>}/>
          <KPI title="Verified" value={kpi.paid} tone="from-emerald-500/25 to-emerald-500/10" icon={<BadgeCheck size={18}/>}/>
          <KPI title="Rejected" value={kpi.unpaid /* here "unpaid" = not verified, if you’d like “cancelled” show from DA PRIVATE */} tone="from-red-500/25 to-red-500/10" icon={<AlertCircle size={18}/>}/>
        </div>

        {/* Optional: committee breakdown from DelCount */}
        {breakdown.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
            <div className="px-4 py-3 font-semibold">Committee Breakdown</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <Th>Committee</Th><Th>Total</Th><Th>Paid</Th><Th>Unpaid</Th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b) => (
                    <tr key={b.name} className="border-t border-white/5">
                      <Td>{b.name}</Td>
                      <Td>{b.total}</Td>
                      <Td>{b.paid}</Td>
                      <Td>{b.unpaid}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 opacity-80" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone, committee, portfolio…"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 outline-none placeholder:text-white/60"
            />
          </div>
          <div className="flex gap-2">
            <FancySelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All statuses" },
                ...STATUS.map(s => ({ value: s, label: title(s) }))
              ]}
              className="flex-1"
            />
            <FancySelect
              value={committee}
              onChange={setCommittee}
              options={[{ value: "all", label: "All committees" }, ...committees.map(c => ({ value: c, label: c }))]}
              className="flex-1"
            />
          </div>
          <div className="text-sm opacity-70 lg:text-right self-center">
            Showing {visible.length} of {rows.length}
          </div>
        </div>

        {/* Table (read-only) */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 sticky top-[54px] z-40">
                <tr>
                  <Th>ID</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Committee</Th>
                  <Th>Portfolio</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={7}/>
                ) : visible.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center opacity-70">No results match your filters.</td></tr>
                ) : visible.map(r => (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.04]">
                    <Td>{r.id}</Td>
                    <Td className="max-w-[220px] truncate" title={r.full_name}>{r.full_name}</Td>
                    <Td className="max-w-[260px] truncate" title={r.email}>{r.email}</Td>
                    <Td className="max-w-[160px] truncate" title={r.phone}>{r.phone}</Td>
                    <Td className="max-w-[200px] truncate" title={r.committee_pref1}>{r.committee_pref1}</Td>
                    <Td className="max-w-[220px] truncate" title={r.portfolio_pref1}>{r.portfolio_pref1}</Td>
                    <Td><StatusPill s={r.payment_status}/></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- Bits ---------- */
function KPI({ title, value, icon, tone = "from-white/15 to-white/5" }) {
  return (
    <div className={cls("rounded-2xl border border-white/10 p-4 bg-gradient-to-br", tone)}>
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">{title}</div>
        <div className="opacity-80">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
function Th({ children, className }) {
  return <th className={cls("text-left px-3 md:py-3 py-2 text-xs md:text-sm font-medium", className)}>{children}</th>;
}
function Td({ children, className }) {
  return <td className={cls("px-3 md:py-3 py-2 align-middle text-xs md:text-sm", className)}>{children}</td>;
}
function StatusPill({ s }) {
  const v = (s || "pending").toLowerCase();
  const tone = v === "verified" ? "bg-emerald-500/20 text-emerald-300"
    : v === "rejected" ? "bg-red-500/20 text-red-300"
    : "bg-yellow-500/20 text-yellow-300";
  return <span className={cls("px-2 py-1 rounded-lg", tone)}>{v}</span>;
}
function SkeletonRows({ cols = 7 }) {
  return Array.from({ length: 7 }).map((_, i) => (
    <tr key={i} className="border-t border-white/5">
      {Array.from({ length: cols }).map((__, j) => (
        <td key={j} className="px-3 py-3"><div className="h-4 rounded bg-white/10 animate-pulse" /></td>
      ))}
    </tr>
  ));
}
