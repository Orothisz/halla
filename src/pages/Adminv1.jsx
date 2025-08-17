// src/pages/Adminv1.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Download, Search, RefreshCw, BadgeCheck, Clock3, AlertCircle,
  History as HistoryIcon, Edit3, Wifi, WifiOff, ShieldAlert, CheckCircle2, Copy
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { LOGO_URL } from "../shared/constants";

/* ---------------- Utils ---------------- */
const cls = (...xs) => xs.filter(Boolean).join(" ");
const safe = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));
const S = (v) => safe(v).toLowerCase().trim();
const numify = (x) => {
  const n = Number(String(x ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
function useDebounced(value, delay = 180) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}
function nowISOsec() { return new Date().toISOString().replace(/\.\d+Z$/,"Z"); }

/* ---------- Background (Roman layer from Home.jsx) ---------- */
function RomanLayer() {
  const { scrollYProgress } = useScroll();
  const yBust = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yColumn = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yLaurel = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const IMG_LEFT = "https://i.postimg.cc/sDqGkrr6/Untitled-design-5.png";
  const IMG_RIGHT = "https://i.postimg.cc/J0ttFTdC/Untitled-design-6.png";
  const IMG_CENTER = "https://i.postimg.cc/66DGSKwH/Untitled-design-7.png";
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 opacity-[.18]"
        style={{
          backgroundImage:
            "radial-gradient(1100px 700px at 80% -10%, rgba(255,255,255,.16), rgba(0,0,0,0)), radial-gradient(900px 600px at 12% 20%, rgba(255,255,255,.11), rgba(0,0,0,0))",
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-20">
        <motion.div style={{ y: yBust }} className="absolute -top-28 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl" />
        <motion.div style={{ y: yColumn }} className="absolute -bottom-28 -right-24 w-[32rem] h-[32rem] rounded-full blur-3xl" />
      </div>
      <motion.img
        src={IMG_LEFT} alt="" loading="lazy" decoding="async"
        className="pointer-events-none fixed left-[-26px] top-[16vh] w-[240px] md:w-[320px] opacity-[.55] md:opacity-[.75] mix-blend-screen select-none -z-20"
        style={{ y: yBust, filter: "grayscale(60%) contrast(110%) blur(0.2px)" }}
      />
      <motion.img
        src={IMG_RIGHT} alt="" loading="lazy" decoding="async"
        className="pointer-events-none fixed right-[-10px] top-[30vh] w-[230px] md:w-[310px] opacity-[.50] md:opacity-[.72] mix-blend-screen select-none -z-20"
        style={{ y: yColumn, filter: "grayscale(60%) contrast(112%) blur(0.2px)" }}
      />
      <motion.img
        src={IMG_CENTER} alt="" loading="lazy" decoding="async"
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-[4vh] w-[540px] max-w-[88vw] opacity-[.40] md:opacity-[.55] mix-blend-screen select-none -z-20"
        style={{ y: yLaurel, filter: "grayscale(55%) contrast(108%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 opacity-[.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 .9'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>\")",
        }}
      />
    </>
  );
}

/* ---------------- Small UI bits ---------------- */
function PortalDropdown({ anchorRef, open, onClose, width, children }) {
  const [box, setBox] = useState({ top: 0, left: 0, width: 200 });
  useEffect(() => {
    function measure() {
      if (!anchorRef?.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setBox({ top: r.bottom + 6, left: r.left, width: width || r.width });
    }
    if (open) {
      measure();
      const off = () => onClose();
      window.addEventListener("scroll", measure, true);
      window.addEventListener("resize", measure);
      document.addEventListener("mousedown", off);
      return () => {
        window.removeEventListener("scroll", measure, true);
        window.removeEventListener("resize", measure);
        document.removeEventListener("mousedown", off);
      };
    }
  }, [open, anchorRef, width, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed z-[9999]" style={{ top: box.top, left: box.left, width: box.width }}>
      {children}
    </div>,
    document.body
  );
}
function FancySelect({ value, onChange, options, className = "" }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];
  return (
    <div className={"relative " + className}>
      <button
        ref={btnRef}
        type="button"
        className="w-full justify-between px-3 py-2 rounded-xl bg-white/90 text-gray-900 hover:bg-white outline-none inline-flex items-center gap-2"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
      >
        <span className="truncate">{current?.label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" className={open ? "rotate-180 transition" : "transition"}>
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      <PortalDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)}>
        <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl max-h-64 overflow-auto">
          {options.map((o) => (
            <button
              key={o.value}
              className={"w-full text-left px-3 py-2 hover:bg-gray-100 " + (o.value === value ? "bg-gray-100" : "")}
              onClick={(e) => { e.stopPropagation(); onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </PortalDropdown>
    </div>
  );
}
function InlineEdit({ value, onSave, placeholder = "—" }) {
  const [v, setV] = useState(value ?? "");
  const [editing, setEditing] = useState(false);
  useEffect(() => setV(value ?? ""), [value]);
  if (!editing) {
    return (
      <button className="w-full text-left truncate hover:underline decoration-dotted" onClick={() => setEditing(true)} title={value}>
        {value || <span className="opacity-60">{placeholder}</span>}
      </button>
    );
  }
  return (
    <input
      autoFocus
      className="w-full px-2 py-1 rounded-lg bg-white/10 outline-none"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { setEditing(false); if (v !== value) onSave(v); }}
      onKeyDown={(e) => {
        if (e.key === "Enter") { setEditing(false); if (v !== value) onSave(v); }
        if (e.key === "Escape") { setEditing(false); setV(value ?? ""); }
      }}
    />
  );
}
function Tag({ children }) {
  return <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs bg-white/10">{children}</span>;
}

/* ---------------- Page ---------------- */
export default function Adminv1() {
  const [me, setMe] = useState({ id: null, email: "", name: "" });
  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession().catch(() => ({ data: null }));
      const user = s?.session?.user;
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).single().catch(() => ({ data: null }));
        setMe({
          id: user.id, email: user.email,
          name: prof?.full_name || user.user_metadata?.name || (user.email ? user.email.split("@")[0] : "admin"),
        });
      }
    })();
  }, []);

  // State
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [q, setQ] = useState("");
  const qDeb = useDebounced(q, 180);
  const [status, setStatus] = useState("all");     // paid | unpaid | rejected | all
  const [committee, setCommittee] = useState("all");
  const [tab, setTab] = useState("delegates");     // delegates | history
  const [live, setLive] = useState(true);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [kpi, setKpi] = useState({ total: 0, paid: 0, unpaid: 0, rejected: 0 });
  const [kpiStale, setKpiStale] = useState(false);
  const [lastSynced, setLastSynced] = useState("");

  /* ---------------- Fetchers ---------------- */
  const API_URL = import.meta.env.VITE_DAPRIVATE_API_URL?.trim();
  const DC_URL  = import.meta.env.VITE_DELCOUNT_JSON_URL?.trim();

  function normalizeRows(arr) {
    const norm = (arr || []).map((r, i) => {
      const st = S(r.payment_status);
      const payment_status =
        st === "verified" ? "paid" :
        st === "rejected" ? "rejected" : "unpaid";
      const out = {
        id: Number(r.id || i + 1),
        full_name: r.full_name || r.name || "",
        email: r.email || "",
        phone: r.phone || r["phone no."] || "",
        alt_phone: r.alt_phone || r.alternate || "",
        committee_pref1: r.committee_pref1 || r.committee || "",
        portfolio_pref1: r.portfolio_pref1 || r.portfolio || "",
        mail_sent: r.mail_sent || r["mail sent"] || "",
        payment_status,
      };
      out._slab = S([out.full_name, out.email, out.phone, out.committee_pref1, out.portfolio_pref1].join(" "));
      return out;
    });
    const setC = new Set();
    norm.forEach((r) => r.committee_pref1 && setC.add(r.committee_pref1));
    setCommittees(Array.from(setC).sort());
    return norm;
  }

  function kpiFromDelCount(json) {
    // STRICT: Paid = row7 colB (0-based [6][1]), Unpaid = row8 colB (0-based [7][1])
    const grid = json?.grid || json?.rows || json?.values;
    if (Array.isArray(grid)) {
      const total  = numify(grid?.[5]?.[1]); // row 6, col B
      const paid   = numify(grid?.[6]?.[1]); // row 7, col B
      const unpaid = numify(grid?.[7]?.[1]); // row 8, col B
      const rejected = numify(json?.totals?.cancellations);
      return { total: total || (paid + unpaid), paid, unpaid, rejected };
    }
    // fallback to totals only (if grid missing)
    const paid   = numify(json?.totals?.paid);
    const unpaid = numify(json?.totals?.unpaid);
    const total  = numify(json?.totals?.delegates) || (paid + unpaid);
    const rejected = numify(json?.totals?.cancellations);
    return { total, paid, unpaid, rejected };
  }

  async function fetchAll({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setKpiStale(false);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const fetchJson = (url) =>
      fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal,
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

    try {
      const daP = API_URL ? fetchJson(API_URL) : Promise.resolve(null);
      const dcP = DC_URL  ? fetchJson(DC_URL)  : Promise.resolve(null);
      const [daJson, dcJson] = await Promise.all([daP, dcP]);

      if (daJson?.rows) setRows(normalizeRows(daJson.rows));
      if (dcJson) {
        setKpi(kpiFromDelCount(dcJson));
        const committeesJson = dcJson?.committees || {};
        const bd = Object.keys(committeesJson).map((name) => ({
          name,
          total: Number(committeesJson[name].total) || 0,
          paid:  Number(committeesJson[name].paid)  || 0,
          unpaid:Number(committeesJson[name].unpaid)|| 0,
        })).sort((a,b) => b.total - a.total);
        setBreakdown(bd);
      } else {
        // keep previous KPI to avoid wrong numbers
        setKpiStale(true);
      }
      setLastSynced(nowISOsec());
    } catch (e) {
      console.error(e);
      setKpiStale(true);
    } finally {
      clearTimeout(timeout);
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => fetchAll({ silent: true }), 25000);
    return () => clearInterval(t);
  }, [live]);

  /* ---------------- Derived (fast, robust search) ---------------- */
  const visible = useMemo(() => {
    const tokens = S(qDeb).replace(/\s+/g, " ").split(" ").filter(Boolean);
    return rows.filter((r) => {
      const passStatus = status === "all" ? true : S(r.payment_status) === status;
      const passCommittee = committee === "all" ? true : S(r.committee_pref1) === S(committee);
      const passSearch = tokens.length === 0 || tokens.every((t) => r._slab.includes(t));
      return passStatus && passCommittee && passSearch;
    });
  }, [rows, qDeb, status, committee]);

  /* ---------------- Actions ---------------- */
  function exportCSV() {
    const headers = ["id","full_name","email","phone","alt_phone","committee_pref1","portfolio_pref1","mail_sent","payment_status"];
    const csv = [headers.join(","), ...visible.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `delegates_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function saveRow(row, patch) {
    const WRITE_URL = API_URL;
    if (!WRITE_URL) { console.error("VITE_DAPRIVATE_API_URL missing"); return; }

    // Map UI status to API value
    let outgoingStatus = patch.payment_status;
    if (outgoingStatus != null) {
      outgoingStatus = outgoingStatus === "paid" ? "verified"
                     : outgoingStatus === "rejected" ? "rejected"
                     : "pending"; // unpaid
    }

    const next = { ...row, ...patch };
    // rebuild search slab on every change
    next._slab = S([next.full_name, next.email, next.phone, next.committee_pref1, next.portfolio_pref1].join(" "));
    setRows((rs) => rs.map((x) => (x.id === row.id ? next : x))); // optimistic

    try {
      const body = {
        action: "update",
        id: row.id,
        fields: {
          full_name: next.full_name,
          email: next.email,
          phone: next.phone,
          alt_phone: next.alt_phone,
          committee_pref1: next.committee_pref1,
          portfolio_pref1: next.portfolio_pref1,
          payment_status: outgoingStatus,
        },
      };
      const res = await fetch(WRITE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error || `HTTP ${res.status}`);

      // optional audit
      if (me.id) {
        await supabase.from("admin_edit_logs").insert({
          actor_id: me.id,
          actor_email: me.email,
          row_id: row.id,
          field: Object.keys(patch)[0],
          old_value: safe(row[Object.keys(patch)[0]]),
          new_value: safe(next[Object.keys(patch)[0]]),
        }).catch(() => null);
      }

      // Re-sync both sources silently so KPIs & table are correct
      fetchAll({ silent: true });
    } catch (e) {
      console.error(e);
      // revert
      setRows((rs) => rs.map((x) => (x.id === row.id ? row : x)));
      alert("Update failed. Please try again.");
    }
  }

  async function loadLogs() {
    setLogsLoading(true);
    try {
      const { data } = await supabase
        .from("admin_edit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      setLogs(data || []);
    } finally { setLogsLoading(false); }
  }
  useEffect(() => { if (tab === "history") loadLogs(); }, [tab]);

  /* ---------------- Render ---------------- */
  return (
    <div className="relative min-h-[100dvh] text-white">
      <RomanLayer />

      {/* Top bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Noir" className="h-8 w-8 rounded-lg ring-1 ring-white/10" />
            <div>
              <div className="text-base font-semibold">Admin • Dashboard</div>
              <div className="text-xs opacity-70">hi, {me.name || "admin"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tag title="Last synced ISO">{lastSynced ? <><CheckCircle2 size={14}/> {lastSynced}</> : "—"}</Tag>
            {kpiStale && <Tag title="Latest KPIs may be stale"><ShieldAlert size={14}/> stale</Tag>}
            <button onClick={() => fetchAll()} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2">
              <RefreshCw size={16} /> Refresh
            </button>
            <button onClick={exportCSV} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2">
              <Download size={16} /> Export CSV
            </button>
            <button
              onClick={() => setLive((v) => !v)}
              className={cls(
                "px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2",
                live ? "bg-emerald-500/20 hover:bg-emerald-500/25 text-emerald-200" : "bg-white/10 hover:bg-white/15"
              )}
              title={live ? "Live sync is ON" : "Live sync is OFF"}
            >
              {live ? <Wifi size={16} /> : <WifiOff size={16} />} Live
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="flex gap-2">
          <TabButton active={tab === "delegates"} onClick={() => setTab("delegates")} icon={<Edit3 size={16} />}>Delegates</TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")} icon={<HistoryIcon size={16} />}>History</TabButton>
        </div>
      </div>

      {tab === "delegates" ? (
        <main className="mx-auto max-w-7xl px-4 py-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5">
            <KPI title="Total"    value={kpi.total}   tone="from-white/15 to-white/5" icon={<BadgeCheck size={18} />} />
            <KPI title="Unpaid"   value={kpi.unpaid}  tone="from-yellow-500/25 to-yellow-500/10" icon={<Clock3 size={18} />} />
            <KPI title="Paid"     value={kpi.paid}    tone="from-emerald-500/25 to-emerald-500/10" icon={<BadgeCheck size={18} />} />
            <KPI title="Rejected" value={kpi.rejected} tone="from-red-500/25 to-red-500/10" icon={<AlertCircle size={18} />} />
          </div>

          {/* Committee Breakdown */}
          {breakdown.length > 0 && (
            <div className="mb-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-white/10 sticky top-0 z-10">
                  <tr className="whitespace-nowrap">
                    <Th>Committee</Th>
                    <Th className="text-right">Total</Th>
                    <Th className="text-right">Paid</Th>
                    <Th className="text-right">Unpaid</Th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b) => (
                    <tr key={b.name} className="border-t border-white/5 hover:bg-white/[0.04]">
                      <Td className="truncate">{b.name}</Td>
                      <Td className="text-right">{b.total}</Td>
                      <Td className="text-right">{b.paid}</Td>
                      <Td className="text-right">{b.unpaid}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  { value: "unpaid", label: "Unpaid" },
                  { value: "paid", label: "Paid" },
                  { value: "rejected", label: "Rejected" },
                ]}
                className="flex-1"
              />
              <FancySelect
                value={committee}
                onChange={setCommittee}
                options={[{ value: "all", label: "All committees" }, ...committees.map((c) => ({ value: c, label: c }))]}
                className="flex-1"
              />
            </div>
            <div className="text-sm opacity-70 lg:text-right self-center">
              Showing {visible.length} of {rows.length} &nbsp; {q || status!=="all" || committee!=="all" ? (
                <button onClick={() => { setQ(""); setStatus("all"); setCommittee("all"); }} className="underline decoration-dotted">Clear filters</button>
              ) : null}
            </div>
          </div>

          {/* Table (desktop) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-14" />
                <col className="w-[220px]" />
                <col className="w-[280px]" />
                <col className="w-[160px]" />
                <col className="w-[200px]" />
                <col className="w-[220px]" />
                <col className="w-[220px]" />
              </colgroup>
              <thead className="bg-white/10 sticky top-0 z-10">
                <tr className="whitespace-nowrap">
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
                  <SkeletonRows cols={7} />
                ) : visible.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center opacity-70">No results match your filters.</td></tr>
                ) : (
                  visible.map((r) => (
                    <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.04]">
                      <Td className="truncate">{r.id}</Td>
                      <Td className="truncate" title={r.full_name}>
                        <InlineEdit value={r.full_name} onSave={(v) => saveRow(r, { full_name: v })} />
                      </Td>
                      <Td className="truncate" title={r.email}>
                        <div className="flex items-center gap-2">
                          <InlineEdit value={r.email} onSave={(v) => saveRow(r, { email: v })} />
                          {r.email && (
                            <button title="Copy email" className="opacity-60 hover:opacity-100" onClick={() => navigator.clipboard?.writeText(r.email)}>
                              <Copy size={14} />
                            </button>
                          )}
                        </div>
                      </Td>
                      <Td className="truncate" title={r.phone}>
                        <div className="flex items-center gap-2">
                          <InlineEdit value={r.phone} onSave={(v) => saveRow(r, { phone: v })} />
                          {r.phone && (
                            <button title="Copy phone" className="opacity-60 hover:opacity-100" onClick={() => navigator.clipboard?.writeText(r.phone)}>
                              <Copy size={14} />
                            </button>
                          )}
                        </div>
                      </Td>
                      <Td className="truncate" title={r.committee_pref1}>
                        <InlineEdit value={r.committee_pref1} onSave={(v) => saveRow(r, { committee_pref1: v })} />
                      </Td>
                      <Td className="truncate" title={r.portfolio_pref1}>
                        <InlineEdit value={r.portfolio_pref1} onSave={(v) => saveRow(r, { portfolio_pref1: v })} />
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <StatusPill s={r.payment_status} />
                          <div className="min-w-[120px]">
                            <FancySelect
                              value={r.payment_status}
                              onChange={(v) => saveRow(r, { payment_status: v })}
                              options={[
                                { value: "paid", label: "paid" },
                                { value: "unpaid", label: "unpaid" },
                                { value: "rejected", label: "rejected" },
                              ]}
                            />
                          </div>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {visible.map((r) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex justify-between items-center">
                  <div className="font-medium truncate">{r.full_name}</div>
                  <StatusPill s={r.payment_status} />
                </div>
                <div className="text-xs opacity-80 truncate">{r.email}</div>
                <div className="text-xs opacity-80">{r.phone}</div>
                <div className="text-xs mt-1">
                  <span className="opacity-70">Committee:</span> {r.committee_pref1} &nbsp; • &nbsp;
                  <span className="opacity-70">Portfolio:</span> {r.portfolio_pref1}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input className="px-2 py-1 rounded-lg bg-white/10 outline-none text-xs" defaultValue={r.committee_pref1} onBlur={(e) => saveRow(r, { committee_pref1: e.target.value })} />
                  <input className="px-2 py-1 rounded-lg bg-white/10 outline-none text-xs" defaultValue={r.portfolio_pref1} onBlur={(e) => saveRow(r, { portfolio_pref1: e.target.value })} />
                  <FancySelect
                    value={r.payment_status}
                    onChange={(v) => saveRow(r, { payment_status: v })}
                    options={[
                      { value: "paid", label: "paid" },
                      { value: "unpaid", label: "unpaid" },
                      { value: "rejected", label: "rejected" },
                    ]}
                    className="col-span-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="px-4 py-3 font-semibold">Edit History</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-[180px]" />
                  <col className="w-[220px]" />
                  <col className="w-20" />
                  <col className="w-[160px]" />
                  <col className="w-[320px]" />
                  <col className="w-[320px]" />
                </colgroup>
                <thead className="bg-white/10 sticky top-0 z-10">
                  <tr className="whitespace-nowrap">
                    <Th>Time</Th>
                    <Th>Actor</Th>
                    <Th>Row</Th>
                    <Th>Field</Th>
                    <Th>Old</Th>
                    <Th>New</Th>
                  </tr>
                </thead>
                <tbody>
                  {logsLoading ? (
                    <SkeletonRows cols={6} />
                  ) : (logs?.length || 0) === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center opacity-70">No edits yet.</td></tr>
                  ) : (
                    logs.map((l) => (
                      <tr key={l.id} className="border-t border-white/5 hover:bg-white/[0.04]">
                        <Td>{new Date(l.created_at).toLocaleString()}</Td>
                        <Td className="truncate" title={l.actor_email}>{l.actor_email}</Td>
                        <Td>{l.row_id}</Td>
                        <Td>{l.field}</Td>
                        <Td className="truncate" title={l.old_value}>{l.old_value}</Td>
                        <Td className="truncate" title={l.new_value}>{l.new_value}</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

/* ---------------- Tiny bits ---------------- */
function TabButton({ active, onClick, children, icon }) {
  return (
    <button
      onClick={onClick}
      className={cls(
        "px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2",
        active ? "bg-white/15" : "bg-white/10 hover:bg-white/15"
      )}
    >
      {icon} {children}
    </button>
  );
}
function KPI({ title, value, icon, tone = "from-white/15 to-white/5" }) {
  return (
    <div className={cls("rounded-2xl border border-white/10 p-4 bg-gradient-to-br", tone)}>
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">{title}</div>
        <div className="opacity-80">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold">{Number.isFinite(value) ? value : 0}</div>
    </div>
  );
}
function Th({ children, className }) {
  return <th className={cls("text-left px-3 md:py-3 py-2 text-xs md:text-sm font-medium", className)}>{children}</th>;
}
function Td({ children, className }) {
  return <td className={cls("px-3 md:py-3 py-2 text-xs md:text-sm align-middle whitespace-nowrap truncate", className)}>{children}</td>;
}
function StatusPill({ s }) {
  const v = (s || "unpaid").toLowerCase();
  const tone =
    v === "paid" ? "bg-emerald-500/20 text-emerald-300"
    : v === "rejected" ? "bg-red-500/20 text-red-300"
    : "bg-yellow-500/20 text-yellow-300";
  return <span className={cls("px-2 py-1 rounded-lg text-xs", tone)}>{v}</span>;
}
function SkeletonRows({ cols = 7 }) {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <tr key={i} className="border-t border-white/5">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-3 py-3">
              <div className="h-4 rounded bg-white/10 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
