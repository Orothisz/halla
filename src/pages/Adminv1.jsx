// src/pages/Adminv1.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Search, RefreshCw, BadgeCheck, Clock3, AlertCircle, History as HistoryIcon, Edit3
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { LOGO_URL } from "../shared/constants";

/* ---------------- BG (identical vibe to Home.jsx) ---------------- */
function NoirBg() {
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

/* ---------------- helpers ---------------- */
const cls = (...xs) => xs.filter(Boolean).join(" ");
const safe = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));
const S = (v) => safe(v).toLowerCase().trim();
const title = (s) => s[0].toUpperCase() + s.slice(1);

function useDebounced(value, delay = 160) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function normalizeRow(r, i) {
  const paidRaw = S(r.payment_status ?? r.paid);
  const payment_status =
    paidRaw.includes("paid") || paidRaw === "yes"
      ? "verified"
      : paidRaw.includes("cancel")
      ? "rejected"
      : "pending";
  return {
    id: Number(r.id ?? r.sno ?? r["s.no"]) || i + 1, // synthetic fallback
    full_name: r.full_name ?? r.name ?? "",
    email: r.email ?? "",
    phone: r.phone ?? r["phone no."] ?? "",
    alt_phone: r.alt_phone ?? r.alternate ?? "",
    committee_pref1: r.committee_pref1 ?? r.committee ?? "",
    portfolio_pref1: r.portfolio_pref1 ?? r.portfolio ?? "",
    mail_sent: r.mail_sent ?? r["mail sent"] ?? "",
    payment_status,
  };
}

/* ---------------- headless select + inline editors ---------------- */
function FancySelect({ value, onChange, options, className = "" }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const current = options.find((o) => o.value === value) || options[0];
  return (
    <div ref={box} className={"relative " + className}>
      <button
        type="button"
        className="w-full justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 outline-none inline-flex items-center gap-2"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{current?.label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" className={open ? "rotate-180 transition" : "transition"}>
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl max-h-64 overflow-auto"
          >
            {options.map((o) => (
              <button
                key={o.value}
                className={"w-full text-left px-3 py-2 hover:bg-white/10 " + (o.value === value ? "bg-white/10" : "")}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InlineEdit({ value, onSave, placeholder = "—" }) {
  const [v, setV] = useState(value ?? "");
  const [editing, setEditing] = useState(false);
  useEffect(() => setV(value ?? ""), [value]);
  if (!editing) {
    return (
      <button
        className="w-full text-left truncate hover:underline decoration-dotted"
        onClick={() => setEditing(true)}
        title={value}
      >
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
      onBlur={() => {
        setEditing(false);
        if (v !== value) onSave(v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          setEditing(false);
          if (v !== value) onSave(v);
        }
        if (e.key === "Escape") {
          setEditing(false);
          setV(value ?? "");
        }
      }}
    />
  );
}

/* ---------------- page ---------------- */
export default function Adminv1() {
  // session (for greeting + logging)
  const [me, setMe] = useState({ id: null, email: "", name: "" });

  // data
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [kpi, setKpi] = useState({ total: 0, paid: 0, unpaid: 0 });
  const [breakdown, setBreakdown] = useState([]);

  // ui state
  const [tab, setTab] = useState("delegates"); // "delegates" | "history"
  const [q, setQ] = useState("");
  const qDeb = useDebounced(q, 180);
  const [status, setStatus] = useState("all");
  const [committee, setCommittee] = useState("all");
  const [committees, setCommittees] = useState([]);

  // history (from supabase)
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const session = s?.session;
      let name = "";
      if (session?.user) {
        const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", session.user.id).single();
        name = prof?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "admin";
        setMe({ id: session.user.id, email: session.user.email, name });
      }
    })();
  }, []);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const DA_URL = import.meta.env.VITE_DAPRIVATE_JSON_URL?.trim();
      const DC_URL = import.meta.env.VITE_DELCOUNT_JSON_URL?.trim();

      if (DA_URL) {
        const res = await fetch(DA_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`DA fetch ${res.status}`);
        const json = await res.json();
        const data = Array.isArray(json?.rows) ? json.rows : [];
        const norm = data
          .filter((r) => S(r.full_name) !== "name") // skip stray header
          .map(normalizeRow);
        setRows(norm);

        const setC = new Set();
        norm.forEach((r) => r.committee_pref1 && setC.add(r.committee_pref1));
        setCommittees(Array.from(setC).sort());

        if (!DC_URL) {
          const total = norm.length;
          const paid = norm.filter((r) => r.payment_status === "verified").length;
          const cancelled = norm.filter((r) => r.payment_status === "rejected").length;
          const pending = total - paid - cancelled;
          setKpi({ total, paid, unpaid: pending });
        }
      }

      if (DC_URL) {
        const res = await fetch(DC_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`DelCount fetch ${res.status}`);
        const json = await res.json();
        const totals = json?.totals || {};
        const committees = json?.committees || {};
        const t = totals.delegates || totals.total || totals.responses || 0;
        const paid = totals.paid || 0;
        const unpaid = totals.unpaid ?? Math.max(0, t - paid);
        setKpi({ total: t, paid, unpaid });

        const bd = Object.keys(committees).map((name) => ({
          name,
          total: committees[name].total || 0,
          paid: committees[name].paid || 0,
          unpaid: committees[name].unpaid || 0,
        }));
        setBreakdown(bd);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // visible rows
  const visible = useMemo(() => {
    const qq = S(qDeb);
    return rows.filter((r) => {
      const hit =
        !qq ||
        S(r.full_name).includes(qq) ||
        S(r.email).includes(qq) ||
        S(r.phone).includes(qq) ||
        S(r.committee_pref1).includes(qq) ||
        S(r.portfolio_pref1).includes(qq);
      const passStatus = status === "all" ? true : S(r.payment_status) === status;
      const passCommittee = committee === "all" ? true : S(r.committee_pref1) === S(committee);
      return hit && passStatus && passCommittee;
    });
  }, [rows, qDeb, status, committee]);

  function exportCSV() {
    const headers = ["id", "full_name", "email", "phone", "alt_phone", "committee_pref1", "portfolio_pref1", "mail_sent", "payment_status"];
    const csv = [
      headers.join(","),
      ...visible.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delegates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // write back to sheet + log in Supabase
  async function saveRow(row, patch) {
    const next = { ...row, ...patch };
    // optimistic UI
    setRows((rs) => rs.map((x) => (x.id === row.id ? next : x)));

    const WRITE_URL = import.meta.env.VITE_SHEET_WRITE_URL?.trim() || import.meta.env.VITE_DAPRIVATE_JSON_URL?.trim(); // allow same endpoint if combined
    if (!WRITE_URL) return;

    const changedField = Object.keys(patch)[0];
    const oldVal = safe(row[changedField]);
    const newVal = safe(next[changedField]);

    try {
      const res = await fetch(WRITE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: row.id, // S.no in sheet
          fields: {
            full_name: next.full_name,
            email: next.email,
            phone: next.phone,
            alt_phone: next.alt_phone,
            committee_pref1: next.committee_pref1,
            portfolio_pref1: next.portfolio_pref1,
            mail_sent: next.mail_sent,
            payment_status: next.payment_status, // verified | pending | rejected
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error || `HTTP ${res.status}`);

      // log to supabase
      await supabase.from("admin_edit_logs").insert({
        actor_id: me.id,
        actor_email: me.email,
        row_id: row.id,
        field: changedField,
        old_value: oldVal,
        new_value: newVal,
      });
    } catch (e) {
      console.error(e);
      // revert if failed
      setRows((rs) => rs.map((x) => (x.id === row.id ? row : x)));
    }
  }

  async function loadLogs() {
    setLogsLoading(true);
    try {
      const { data } = await supabase
        .from("admin_edit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setLogs(data || []);
    } finally {
      setLogsLoading(false);
    }
  }

  // whenever tab switches to history, fetch logs
  useEffect(() => {
    if (tab === "history") loadLogs();
  }, [tab]);

  return (
    <div className="relative min-h-[100dvh] text-white">
      <NoirBg />

      {/* topbar */}
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
            <button onClick={fetchAll} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2">
              <RefreshCw size={16} /> Refresh
            </button>
            <button onClick={exportCSV} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* tabs */}
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="flex gap-2">
          <TabButton active={tab === "delegates"} onClick={() => setTab("delegates")} icon={<Edit3 size={16} />}>
            Delegates
          </TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")} icon={<HistoryIcon size={16} />}>
            History
          </TabButton>
        </div>
      </div>

      {tab === "delegates" ? (
        <main className="mx-auto max-w-7xl px-4 py-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5">
            <KPI title="Total" value={kpi.total} tone="from-white/15 to-white/5" icon={<BadgeCheck size={18} />} />
            <KPI title="Pending" value={Math.max(0, kpi.total - kpi.paid - kpi.unpaid)} tone="from-yellow-500/25 to-yellow-500/10" icon={<Clock3 size={18} />} />
            <KPI title="Verified" value={kpi.paid} tone="from-emerald-500/25 to-emerald-500/10" icon={<BadgeCheck size={18} />} />
            <KPI title="Unpaid" value={kpi.unpaid} tone="from-red-500/25 to-red-500/10" icon={<AlertCircle size={18} />} />
          </div>

          {/* optional breakdown */}
          {breakdown.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm mb-5">
              <div className="px-4 py-3 font-semibold">Committee Breakdown</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                  <thead className="bg-white/10">
                    <tr className="whitespace-nowrap">
                      <Th className="w-[220px]">Committee</Th>
                      <Th className="w-28">Total</Th>
                      <Th className="w-28">Paid</Th>
                      <Th className="w-28">Unpaid</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.map((b) => (
                      <tr key={b.name} className="border-t border-white/5">
                        <Td className="truncate">{b.name}</Td>
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

          {/* controls */}
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
                  { value: "pending", label: "Pending" },
                  { value: "verified", label: "Verified" },
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
              Showing {visible.length} of {rows.length}
            </div>
          </div>

          {/* table (desktop) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-14" />
                <col className="w-[220px]" />
                <col className="w-[280px]" />
                <col className="w-[160px]" />
                <col className="w-[200px]" />
                <col className="w-[220px]" />
                <col className="w-[140px]" />
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
                  <tr>
                    <td colSpan="7" className="p-8 text-center opacity-70">
                      No results match your filters.
                    </td>
                  </tr>
                ) : (
                  visible.map((r) => (
                    <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.04]">
                      <Td className="truncate">{r.id}</Td>
                      <Td className="truncate" title={r.full_name}>
                        <InlineEdit value={r.full_name} onSave={(v) => saveRow(r, { full_name: v })} />
                      </Td>
                      <Td className="truncate" title={r.email}>
                        <InlineEdit value={r.email} onSave={(v) => saveRow(r, { email: v })} />
                      </Td>
                      <Td className="truncate" title={r.phone}>
                        <InlineEdit value={r.phone} onSave={(v) => saveRow(r, { phone: v })} />
                      </Td>
                      <Td className="truncate" title={r.committee_pref1}>
                        <InlineEdit value={r.committee_pref1} onSave={(v) => saveRow(r, { committee_pref1: v })} />
                      </Td>
                      <Td className="truncate" title={r.portfolio_pref1}>
                        <InlineEdit value={r.portfolio_pref1} onSave={(v) => saveRow(r, { portfolio_pref1: v })} />
                      </Td>
                      <Td>
                        <StatusPill s={r.payment_status} />
                        <div className="mt-1">
                          <FancySelect
                            value={r.payment_status}
                            onChange={(v) => saveRow(r, { payment_status: v })}
                            options={[
                              { value: "verified", label: "verified" },
                              { value: "pending", label: "pending" },
                              { value: "rejected", label: "rejected" },
                            ]}
                          />
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
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
                  <input
                    className="px-2 py-1 rounded-lg bg-white/10 outline-none text-xs"
                    defaultValue={r.committee_pref1}
                    onBlur={(e) => saveRow(r, { committee_pref1: e.target.value })}
                  />
                  <input
                    className="px-2 py-1 rounded-lg bg-white/10 outline-none text-xs"
                    defaultValue={r.portfolio_pref1}
                    onBlur={(e) => saveRow(r, { portfolio_pref1: e.target.value })}
                  />
                  <FancySelect
                    value={r.payment_status}
                    onChange={(v) => saveRow(r, { payment_status: v })}
                    options={[
                      { value: "verified", label: "verified" },
                      { value: "pending", label: "pending" },
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
                  <col className="w-[200px]" />
                  <col className="w-20" />
                  <col className="w-[160px]" />
                  <col className="w-[300px]" />
                  <col className="w-[300px]" />
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
                    <tr>
                      <td colSpan="6" className="p-8 text-center opacity-70">
                        No edits yet.
                      </td>
                    </tr>
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

/* ---------------- UI bits ---------------- */
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
      <div className="mt-2 text-2xl font-semibold">{value}</div>
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
  const v = (s || "pending").toLowerCase();
  const tone = v === "verified" ? "bg-emerald-500/20 text-emerald-300" : v === "rejected" ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300";
  return <span className={cls("px-2 py-1 rounded-lg", tone)}>{v}</span>;
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
