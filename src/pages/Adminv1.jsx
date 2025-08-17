// src/pages/Adminv1.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Download, Search, RefreshCw, BadgeCheck, Clock3, AlertCircle,
  History as HistoryIcon, Edit3, Wifi, WifiOff, ShieldAlert, CheckCircle2,
  Copy, ChevronLeft, ChevronRight, Eye, EyeOff, Columns, Settings, TriangleAlert,
  Users, CheckSquare, Square, Undo2, Wand2, ChartNoAxesGantt, Filter, SlidersHorizontal
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { LOGO_URL } from "../shared/constants";

/* =========================================================================
   Utils
   ========================================================================= */
const cls = (...xs) => xs.filter(Boolean).join(" ");
const safe = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));
const S = (v) => safe(v).toLowerCase().trim();
const numify = (x) => {
  const n = Number(String(x ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||"").trim());
const phoneOk = (p) => /^[0-9+\-\s().]{6,}$/.test(String(p||"").trim());
const STATUS_UI = ["paid", "unpaid", "rejected"];
const STATUS_OUT = (ui) => ui === "paid" ? "verified" : ui === "rejected" ? "rejected" : "pending";
const OUT_TO_UI = (out) => out === "verified" ? "paid" : out === "rejected" ? "rejected" : "unpaid";
const nowISOsec = () => new Date().toISOString().replace(/\.\d+Z$/,"Z");
const uniq = (xs) => Array.from(new Set(xs));

function useDebounced(value, delay = 180) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}

function persist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function recall(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

/* =========================================================================
   Background (Roman layer from Home.jsx)
   ========================================================================= */
function RomanLayer() {
  const { scrollYProgress } = useScroll();
  const yBust = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yColumn = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yLaurel = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const IMG_LEFT   = "https://i.postimg.cc/sDqGkrr6/Untitled-design-5.png";
  const IMG_RIGHT  = "https://i.postimg.cc/J0ttFTdC/Untitled-design-6.png";
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

/* =========================================================================
   Generic UI widgets
   ========================================================================= */
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
      const off = (e) => { if (!anchorRef?.current?.contains?.(e.target)) onClose(); };
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

function FancySelect({ value, onChange, options, className = "", disabled=false }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];
  return (
    <div className={"relative " + className}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        className={cls(
          "w-full justify-between px-3 py-2 rounded-xl text-sm outline-none inline-flex items-center gap-2",
          disabled ? "bg-white/20 opacity-60 cursor-not-allowed" : "bg-white/90 text-gray-900 hover:bg-white"
        )}
        onClick={(e) => { e.stopPropagation(); if (!disabled) setOpen((v) => !v); }}
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

function InlineEdit({ value, onSave, placeholder = "—", disabled=false, validate }) {
  const [v, setV] = useState(value ?? "");
  const [editing, setEditing] = useState(false);
  useEffect(() => setV(value ?? ""), [value]);
  if (disabled) return <span className="truncate">{value || <span className="opacity-60">{placeholder}</span>}</span>;
  if (!editing) {
    return (
      <button className="w-full text-left truncate hover:underline decoration-dotted" onClick={() => setEditing(true)} title={value}>
        {value || <span className="opacity-60">{placeholder}</span>}
      </button>
    );
  }
  const bad = validate ? !validate(v) : false;
  return (
    <input
      autoFocus
      className={cls("w-full px-2 py-1 rounded-lg outline-none", bad ? "bg-red-400/20 ring-1 ring-red-500" : "bg-white/10")}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (v !== value && !bad) onSave(v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") { setEditing(false); if (v !== value && !bad) onSave(v); }
        if (e.key === "Escape") { setEditing(false); setV(value ?? ""); }
      }}
    />
  );
}

function Tag({ children, tone="default", title }) {
  const classes = tone === "warn" ? "bg-yellow-400/20 text-yellow-200"
    : tone === "error" ? "bg-red-500/20 text-red-200"
    : tone === "ok" ? "bg-emerald-500/20 text-emerald-200"
    : "bg-white/10";
  return <span title={title} className={cls("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs", classes)}>{children}</span>;
}

function Highlighter({ text, tokens }) {
  if (!tokens?.length || !text) return <>{text}</>;
  const tks = uniq(tokens.filter(Boolean).map(S)).filter(Boolean);
  if (!tks.length) return <>{text}</>;
  const parts = [];
  let remaining = text;
  let idx = 0;
  while (remaining) {
    const lower = remaining.toLowerCase();
    let earliest = { i: -1, tk: "" };
    for (const tk of tks) {
      const pos = lower.indexOf(tk);
      if (pos >= 0 && (earliest.i < 0 || pos < earliest.i)) earliest = { i: pos, tk };
    }
    if (earliest.i < 0) {
      parts.push(<span key={"p"+(idx++)}>{remaining}</span>);
      break;
    }
    if (earliest.i > 0) {
      parts.push(<span key={"p"+(idx++)}>{remaining.slice(0, earliest.i)}</span>);
    }
    parts.push(<mark key={"m"+(idx++)} className="bg-yellow-500/30 rounded">{remaining.slice(earliest.i, earliest.i + earliest.tk.length)}</mark>);
    remaining = remaining.slice(earliest.i + earliest.tk.length);
  }
  return <>{parts}</>;
}

/* =========================================================================
   Page
   ========================================================================= */
export default function Adminv1() {
  /* ---------------- Session / RBAC ---------------- */
  const [me, setMe] = useState({ id: null, email: "", name: "" });
  useEffect(() => {
    (async () => {
      try {
        const { data: s } = await supabase.auth.getSession();
        const user = s?.session?.user;
        if (user) {
          const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
          setMe({
            id: user.id, email: user.email,
            name: prof?.full_name || user.user_metadata?.name || (user.email ? user.email.split("@")[0] : "admin"),
          });
        }
      } catch {}
    })();
  }, []);
  const adminList = useMemo(() => (import.meta.env.VITE_ADMIN_EMAILS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean), []);
  const canEdit = !!me.id && (adminList.length ? adminList.includes((me.email||"").toLowerCase()) : true);

  /* ---------------- State ---------------- */
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [q, setQ] = useState(recall("adm.q",""));
  const qDeb = useDebounced(q, 160);
  const [status, setStatus] = useState(recall("adm.status","all"));     // paid | unpaid | rejected | all
  const [committee, setCommittee] = useState(recall("adm.committee","all"));
  const [tab, setTab] = useState("delegates");     // delegates | history | health
  const [live, setLive] = useState(recall("adm.live", true));
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [kpi, setKpi] = useState({ total: 0, paid: 0, unpaid: 0, rejected: 0 });
  const [kpiStale, setKpiStale] = useState(false);
  const [lastSynced, setLastSynced] = useState("");
  const [piiMask, setPiiMask] = useState(recall("adm.piiMask", true));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(recall("adm.pageSize", 50));
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [cols, setCols] = useState(recall("adm.cols", { email:true, phone:true, committee:true, portfolio:true, status:true }));
  const [sourcePref, setSourcePref] = useState(recall("adm.kpiSource","grid")); // 'grid' | 'totals'
  const [toast, setToast] = useState([]); // [{id, text, tone}]
  const [health, setHealth] = useState({ da: null, dc: null, mismatched: false, paid: {grid:null, totals:null}, unpaid: {grid:null, totals:null} });

  const tokens = useMemo(() => S(qDeb).replace(/\s+/g, " ").split(" ").filter(Boolean), [qDeb]);
  useEffect(() => persist("adm.q", q), [q]);
  useEffect(() => persist("adm.status", status), [status]);
  useEffect(() => persist("adm.committee", committee), [committee]);
  useEffect(() => persist("adm.live", live), [live]);
  useEffect(() => persist("adm.pageSize", pageSize), [pageSize]);
  useEffect(() => persist("adm.cols", cols), [cols]);
  useEffect(() => persist("adm.kpiSource", sourcePref), [sourcePref]);
  useEffect(() => { setPage(1); }, [qDeb, status, committee]); // reset page on filters

  /* ---------------- Fetchers ---------------- */
  const API_URL = import.meta.env.VITE_DAPRIVATE_API_URL?.trim();
  const DC_URL  = import.meta.env.VITE_DELCOUNT_JSON_URL?.trim();

  const normalizeRows = useCallback((arr) => {
    const norm = (arr || []).filter(r => r && (r.full_name || r.email || r.phone)).map((r, i) => {
      const out = {
        id: Number(r.id || r.sno || i + 1),
        full_name: r.full_name || r.name || "",
        email: r.email || "",
        phone: r.phone || r["phone no."] || "",
        alt_phone: r.alt_phone || r.alternate || "",
        committee_pref1: r.committee_pref1 || r.committee || "",
        portfolio_pref1: r.portfolio_pref1 || r.portfolio || "",
        mail_sent: r.mail_sent || r["mail sent"] || "",
        payment_status: OUT_TO_UI(r.payment_status),
      };
      out._slab = S([out.full_name, out.email, out.phone, out.committee_pref1, out.portfolio_pref1].join(" "));
      return out;
    });
    const setC = new Set();
    norm.forEach((r) => r.committee_pref1 && setC.add(r.committee_pref1));
    setCommittees(Array.from(setC).sort());
    return norm;
  }, []);

  const computeKPI = useCallback((dcJson) => {
    // Strict read from grid row6/7/8 (B col), fallback to totals
    const grid = dcJson?.grid || dcJson?.rows || dcJson?.values;
    let kGrid = { total:null, paid:null, unpaid:null };
    if (Array.isArray(grid)) {
      kGrid = {
        total:  numify(grid?.[5]?.[1]), // row 6, col B
        paid:   numify(grid?.[6]?.[1]), // row 7, col B
        unpaid: numify(grid?.[7]?.[1])  // row 8, col B
      };
      if (!kGrid.total) kGrid.total = (kGrid.paid ?? 0) + (kGrid.unpaid ?? 0);
    }
    const kTotals = {
      total:  numify(dcJson?.totals?.delegates) || null,
      paid:   numify(dcJson?.totals?.paid) || null,
      unpaid: numify(dcJson?.totals?.unpaid) || null
    };
    const rejected = numify(dcJson?.totals?.cancellations) || 0;

    const src = sourcePref === "grid" ? kGrid : kTotals;
    const next = {
      total:  src.total ?? kTotals.total ?? kGrid.total ?? 0,
      paid:   src.paid  ?? kTotals.paid  ?? kGrid.paid  ?? 0,
      unpaid: src.unpaid?? kTotals.unpaid?? kGrid.unpaid?? 0,
      rejected
    };

    const mismatch = (kGrid.paid!=null && kTotals.paid!=null && kGrid.paid !== kTotals.paid)
                  || (kGrid.unpaid!=null && kTotals.unpaid!=null && kGrid.unpaid !== kTotals.unpaid);

    setHealth(h => ({
      ...h,
      mismatched: !!mismatch,
      paid: { grid: kGrid.paid, totals: kTotals.paid },
      unpaid: { grid: kGrid.unpaid, totals: kTotals.unpaid }
    }));
    return next;
  }, [sourcePref]);

  async function fetchAll({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setKpiStale(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const fetchJson = async (url) => {
      const t0 = performance.now();
      try {
        const r = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store", signal: controller.signal });
        const ms = Math.round(performance.now() - t0);
        if (!r.ok) return { ok:false, ms, json:null, status:r.status };
        const json = await r.json();
        return { ok:true, ms, json, status:r.status };
      } catch {
        const ms = Math.round(performance.now() - t0);
        return { ok:false, ms, json:null, status:0 };
      }
    };

    try {
      const [da, dc] = await Promise.all([
        API_URL ? fetchJson(API_URL) : Promise.resolve({ ok:false }),
        DC_URL  ? fetchJson(DC_URL)  : Promise.resolve({ ok:false }),
      ]);

      setHealth(h => ({ ...h, da, dc }));

      if (da.ok && da.json?.rows) {
        setRows(normalizeRows(da.json.rows));
      }

      if (dc.ok && dc.json) {
        setKpi(computeKPI(dc.json));
        const committeesJson = dc.json?.committees || {};
        const bd = Object.keys(committeesJson).map((name) => ({
          name,
          total: Number(committeesJson[name].total) || 0,
          paid:  Number(committeesJson[name].paid)  || 0,
          unpaid:Number(committeesJson[name].unpaid)|| 0,
        })).sort((a,b) => b.total - a.total);
        setBreakdown(bd);
      } else {
        setKpiStale(true); // keep previous kpi; don't guess from rows
      }

      setLastSynced(nowISOsec());
    } finally {
      clearTimeout(timeout);
      if (!silent) setLoading(false);
    }
  }
  useEffect(() => { fetchAll(); /* initial */ }, []);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => fetchAll({ silent: true }), 25000);
    return () => clearInterval(t);
  }, [live]);

  /* ---------------- Derived: search + filters + pagination ---------------- */
  const visible = useMemo(() => {
    const tks = tokens;
    const pass = (r) => {
      const passStatus = status === "all" ? true : S(r.payment_status) === status;
      const passCommittee = committee === "all" ? true : S(r.committee_pref1) === S(committee);
      const passSearch = tks.length === 0 || tks.every((t) => r._slab.includes(t));
      return passStatus && passCommittee && passSearch;
    };
    return rows.filter(pass);
  }, [rows, tokens, status, committee]);

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageClamped = Math.min(Math.max(1, page), totalPages);
  const start = (pageClamped - 1) * pageSize;
  const pageRows = visible.slice(start, start + pageSize);

  /* ---------------- Bulk selection / actions ---------------- */
  const allOnPageSelected = pageRows.length>0 && pageRows.every(r => selectedIds.has(r.id));
  const toggleRowSel = (id) => setSelectedIds(s => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const togglePageSel = () => setSelectedIds(s => {
    const n = new Set(s);
    if (allOnPageSelected) { pageRows.forEach(r => n.delete(r.id)); }
    else { pageRows.forEach(r => n.add(r.id)); }
    return n;
  });

  /* ---------------- Toasts & Undo ---------------- */
  const addToast = (text, tone="default", duration=3000, action) => {
    const id = Math.random().toString(36).slice(2);
    setToast(ts => [...ts, { id, text, tone, action }]);
    if (duration) setTimeout(() => setToast(ts => ts.filter(t => t.id !== id)), duration);
  };

  const pendingUndo = useRef([]); // items: { rowId, prev, timer }
  const queueUndo = (rowId, prevRow) => {
    const timer = setTimeout(() => {
      pendingUndo.current = pendingUndo.current.filter(x => x.rowId !== rowId);
    }, 10000);
    pendingUndo.current.push({ rowId, prev: prevRow, timer });
    addToast(<>Saved. <button className="underline" onClick={() => doUndo(rowId)}>Undo</button></>, "ok", 10000);
  };
  const doUndo = async (rowId) => {
    const idx = pendingUndo.current.findIndex(x => x.rowId === rowId);
    if (idx < 0) return;
    const { prev, timer } = pendingUndo.current[idx];
    clearTimeout(timer);
    pendingUndo.current.splice(idx,1);
    // write previous fields back
    await saveRow(prev, prev, true);
  };

  /* ---------------- Actions: Export / Save / Bulk ---------------- */
  function exportCSV() {
    const headers = ["id","full_name","email","phone","alt_phone","committee_pref1","portfolio_pref1","mail_sent","payment_status"];
    const list = visible; // export filtered list
    const csv = [headers.join(","), ...list.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `delegates_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function saveRow(row, patch, isUndo=false) {
    const WRITE_URL = API_URL;
    if (!WRITE_URL) { addToast("Write URL missing", "error"); return; }

    // Validation
    if (patch.email != null && patch.email !== row.email && patch.email && !emailOk(patch.email)) {
      addToast("Invalid email", "error"); return;
    }
    if (patch.phone != null && patch.phone !== row.phone && patch.phone && !phoneOk(patch.phone)) {
      addToast("Invalid phone", "error"); return;
    }
    if (patch.payment_status != null && !STATUS_UI.includes(patch.payment_status)) {
      addToast("Invalid status", "error"); return;
    }

    const next = { ...row, ...patch };
    next._slab = S([next.full_name, next.email, next.phone, next.committee_pref1, next.portfolio_pref1].join(" "));

    // optimistic UI
    setRows((rs) => rs.map((x) => (x.id === row.id ? next : x)));

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
          payment_status: patch.payment_status != null ? STATUS_OUT(patch.payment_status) : undefined,
        },
      };
      const res = await fetch(WRITE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error || `HTTP ${res.status}`);

      if (!isUndo) queueUndo(row.id, row);

      // audit
      if (me.id) {
        try {
          await supabase.from("admin_edit_logs").insert({
            actor_id: me.id, actor_email: me.email, row_id: row.id,
            field: Object.keys(patch)[0],
            old_value: safe(row[Object.keys(patch)[0]]),
            new_value: safe(next[Object.keys(patch)[0]]),
          });
        } catch {}
      }

      // silent re-sync so KPIs/breakdown always correct
      fetchAll({ silent: true });
    } catch (e) {
      // revert
      setRows((rs) => rs.map((x) => (x.id === row.id ? row : x)));
      addToast("Update failed", "error");
    }
  }

  async function bulkStatus(newStatus) {
    if (!canEdit) return;
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    addToast(`Updating ${ids.length} rows...`, "default", 2000);
    for (const id of ids) {
      const row = rows.find(r => r.id === id);
      if (!row) continue;
      // eslint-disable-next-line no-await-in-loop
      await saveRow(row, { payment_status: newStatus });
    }
    setSelectedIds(new Set());
    addToast("Bulk update complete", "ok");
  }

  /* ---------------- Logs & Health ---------------- */
  async function loadLogs() {
    setLogsLoading(true);
    try {
      const { data } = await supabase.from("admin_edit_logs").select("*").order("created_at", { ascending: false }).limit(300);
      setLogs(data || []);
    } catch {
      setLogs([]);
    } finally { setLogsLoading(false); }
  }
  useEffect(() => { if (tab === "history") loadLogs(); }, [tab]);

  /* ---------------- Keyboard Shortcuts ---------------- */
  const searchRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); fetchAll(); }
      if (e.key.toLowerCase() === "l" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setLive(v=>!v); }
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setSourcePref(p => p==="grid" ? "totals" : "grid"); }
      if (e.key.toLowerCase() === "p" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setPiiMask(m=>!m); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
              <div className="text-xs opacity-70">hi, {me.name || "admin"} {canEdit ? <Tag tone="ok">editor</Tag> : <Tag>viewer</Tag>}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tag title="Last synced ISO">{lastSynced ? <><CheckCircle2 size={14}/> {lastSynced}</> : "—"}</Tag>
            {kpiStale && <Tag tone="warn" title="DelCount unavailable; showing last good KPIs"><ShieldAlert size={14}/> stale</Tag>}
            {health.mismatched && <Tag tone="error" title={`Grid vs Totals mismatch: paid ${health.paid.grid}≠${health.paid.totals} or unpaid ${health.unpaid.grid}≠${health.unpaid.totals}`}><TriangleAlert size={14}/> KPI mismatch</Tag>}
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
              title={live ? "Live sync is ON (every 25s)" : "Live sync is OFF"}
            >
              {live ? <Wifi size={16} /> : <WifiOff size={16} />} Live
            </button>
            <button
              onClick={() => setTab(t => t==="health" ? "delegates" : "health")}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"
              title="Data health panel"
            >
              <ChartNoAxesGantt size={16}/> Health
            </button>
          </div>
        </div>
      </header>

      {/* Tab switcher */}
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "delegates"} onClick={() => setTab("delegates")} icon={<Edit3 size={16} />}>Delegates</TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")} icon={<HistoryIcon size={16} />}>History</TabButton>
          <TabButton active={tab === "health"} onClick={() => setTab("health")} icon={<ShieldAlert size={16} />}>Health</TabButton>
        </div>
      </div>

      {tab === "delegates" && (
        <main className="mx-auto max-w-7xl px-4 py-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5">
            <KPI title="Total"    value={kpi.total}   tone="from-white/15 to-white/5" icon={<Users size={18} />} />
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
          <div className="mb-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 opacity-80" size={18} />
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search: name, email, phone, committee, portfolio (press / to focus)"
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
            <div className="flex items-center gap-2 justify-between lg:justify-end">
              <button
                onClick={() => { setQ(""); setStatus("all"); setCommittee("all"); }}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"
                title="Clear filters"
              ><Filter size={16}/> Clear</button>

              <button
                onClick={() => setCols(c => ({...c, email:!c.email, phone:!c.phone}))}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"
                title="Toggle contact columns"
              ><Columns size={16}/> Columns</button>

              <button
                onClick={() => setPiiMask(m=>!m)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"
                title="Mask/unmask PII (email/phone)"
              >{piiMask ? <EyeOff size={16}/> : <Eye size={16}/>}{piiMask ? "Mask" : "Unmask"}</button>
            </div>
          </div>

          {/* Bulk bar */}
          <div className="mb-3 flex flex-wrap gap-2 items-center">
            <Tag><CheckSquare size={14}/> {selectedIds.size} selected</Tag>
            <button
              disabled={!canEdit || selectedIds.size===0}
              onClick={() => bulkStatus("paid")}
              className={cls("px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2",
                selectedIds.size>0 && canEdit ? "bg-emerald-500/20 hover:bg-emerald-500/25" : "bg-white/10 opacity-60 cursor-not-allowed")}
            ><BadgeCheck size={14}/> Mark Paid</button>
            <button
              disabled={!canEdit || selectedIds.size===0}
              onClick={() => bulkStatus("unpaid")}
              className={cls("px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2",
                selectedIds.size>0 && canEdit ? "bg-yellow-500/20 hover:bg-yellow-500/25" : "bg-white/10 opacity-60 cursor-not-allowed")}
            ><Clock3 size={14}/> Mark Unpaid</button>
            <button
              disabled={!canEdit || selectedIds.size===0}
              onClick={() => bulkStatus("rejected")}
              className={cls("px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2",
                selectedIds.size>0 && canEdit ? "bg-red-500/20 hover:bg-red-500/25" : "bg-white/10 opacity-60 cursor-not-allowed")}
            ><AlertCircle size={14}/> Mark Rejected</button>

            <div className="ml-auto inline-flex items-center gap-2">
              <SlidersHorizontal size={16} className="opacity-70" />
              <span className="text-sm opacity-80">Rows per page</span>
              <FancySelect
                value={String(pageSize)}
                onChange={(v) => setPageSize(Number(v))}
                options={[{value:"25",label:"25"}, {value:"50",label:"50"}, {value:"100",label:"100"}]}
                className="w-[90px]"
              />
            </div>
          </div>

          {/* Table (desktop) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-12" />
                <col className="w-14" />
                <col className="w-[220px]" />
                {cols.email && <col className="w-[260px]" />}
                {cols.phone && <col className="w-[160px]" />}
                {cols.committee && <col className="w-[200px]" />}
                {cols.portfolio && <col className="w-[220px]" />}
                {cols.status && <col className="w-[220px]" />}
              </colgroup>
              <thead className="bg-white/10 sticky top-0 z-10">
                <tr className="whitespace-nowrap">
                  <Th className="text-center">
                    <button title={allOnPageSelected ? "Unselect page" : "Select page"} onClick={togglePageSel}>
                      {allOnPageSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
                    </button>
                  </Th>
                  <Th>ID</Th>
                  <Th>Name</Th>
                  {cols.email && <Th>Email</Th>}
                  {cols.phone && <Th>Phone</Th>}
                  {cols.committee && <Th>Committee</Th>}
                  {cols.portfolio && <Th>Portfolio</Th>}
                  {cols.status && <Th>Status</Th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={3 + (cols.email?1:0) + (cols.phone?1:0) + (cols.committee?1:0) + (cols.portfolio?1:0) + (cols.status?1:0)} />
                ) : pageRows.length === 0 ? (
                  <tr><td colSpan="12" className="p-8 text-center opacity-70">No results match your filters.</td></tr>
                ) : (
                  pageRows.map((r) => (
                    <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.04]">
                      <Td className="text-center">
                        <button onClick={() => toggleRowSel(r.id)} title={selectedIds.has(r.id) ? "Unselect" : "Select"}>
                          {selectedIds.has(r.id) ? <CheckSquare size={16}/> : <Square size={16}/>}
                        </button>
                      </Td>
                      <Td className="truncate">{r.id}</Td>
                      <Td className="truncate" title={r.full_name}>
                        <Highlighter text={r.full_name} tokens={tokens}/>
                        {canEdit && <InlineEdit value={r.full_name} onSave={(v) => saveRow(r, { full_name: v })} disabled={!canEdit} />}
                      </Td>
                      {cols.email && (
                        <Td className="truncate" title={r.email}>
                          <div className="flex items-center gap-2">
                            <span className={piiMask ? "blur-[2px] hover:blur-0 transition" : ""}>
                              <Highlighter text={r.email} tokens={tokens}/>
                            </span>
                            {!!r.email && (
                              <>
                                <a className="opacity-70 hover:opacity-100 underline decoration-dotted" href={`mailto:${r.email}`}>mail</a>
                                <button title="Copy email" className="opacity-60 hover:opacity-100" onClick={() => navigator.clipboard?.writeText(r.email)}><Copy size={14} /></button>
                              </>
                            )}
                          </div>
                          {canEdit && <InlineEdit value={r.email} onSave={(v) => saveRow(r, { email: v })} disabled={!canEdit} validate={emailOk} />}
                        </Td>
                      )}
                      {cols.phone && (
                        <Td className="truncate" title={r.phone}>
                          <div className="flex items-center gap-2">
                            <span className={piiMask ? "blur-[2px] hover:blur-0 transition" : ""}>
                              <Highlighter text={r.phone} tokens={tokens}/>
                            </span>
                            {!!r.phone && (
                              <>
                                <a className="opacity-70 hover:opacity-100 underline decoration-dotted" href={`https://wa.me/${r.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer">wa</a>
                                <button title="Copy phone" className="opacity-60 hover:opacity-100" onClick={() => navigator.clipboard?.writeText(r.phone)}><Copy size={14} /></button>
                              </>
                            )}
                          </div>
                          {canEdit && <InlineEdit value={r.phone} onSave={(v) => saveRow(r, { phone: v })} disabled={!canEdit} validate={phoneOk} />}
                        </Td>
                      )}
                      {cols.committee && (
                        <Td className="truncate" title={r.committee_pref1}>
                          <Highlighter text={r.committee_pref1} tokens={tokens}/>
                          {canEdit && <InlineEdit value={r.committee_pref1} onSave={(v) => saveRow(r, { committee_pref1: v })} disabled={!canEdit} />}
                        </Td>
                      )}
                      {cols.portfolio && (
                        <Td className="truncate" title={r.portfolio_pref1}>
                          <Highlighter text={r.portfolio_pref1} tokens={tokens}/>
                          {canEdit && <InlineEdit value={r.portfolio_pref1} onSave={(v) => saveRow(r, { portfolio_pref1: v })} disabled={!canEdit} />}
                        </Td>
                      )}
                      {cols.status && (
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
                                disabled={!canEdit}
                              />
                            </div>
                          </div>
                        </Td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm opacity-80">
              Showing <b>{pageRows.length}</b> of <b>{visible.length}</b> (total <b>{rows.length}</b>)
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p-1))}
                disabled={pageClamped <= 1}
              ><ChevronLeft size={16}/></button>
              <span className="text-sm">Page {pageClamped} / {totalPages}</span>
              <button
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p+1))}
                disabled={pageClamped >= totalPages}
              ><ChevronRight size={16}/></button>
            </div>
          </div>
        </main>
      )}

      {tab === "history" && (
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

      {tab === "health" && (
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <div className="font-semibold mb-3 flex items-center gap-2"><Settings size={16}/> Data Sources</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Registrations (DAPrivate)</span>
                  <span className="flex items-center gap-2">
                    {health.da?.ok ? <Tag tone="ok"><CheckCircle2 size={14}/> OK</Tag> : <Tag tone="error"><ShieldAlert size={14}/> FAIL</Tag>}
                    <Tag>{health.da?.ms ?? "—"} ms</Tag>
                    <Tag>HTTP {health.da?.status ?? "—"}</Tag>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>DelCount (KPIs)</span>
                  <span className="flex items-center gap-2">
                    {health.dc?.ok ? <Tag tone="ok"><CheckCircle2 size={14}/> OK</Tag> : <Tag tone="error"><ShieldAlert size={14}/> FAIL</Tag>}
                    <Tag>{health.dc?.ms ?? "—"} ms</Tag>
                    <Tag>HTTP {health.dc?.status ?? "—"}</Tag>
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="font-semibold mb-2 flex items-center gap-2"><Wand2 size={16}/> KPI Source of Truth</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSourcePref("grid")}
                    className={cls("px-3 py-1.5 rounded-lg text-sm", sourcePref==="grid" ? "bg-white/20 ring-1 ring-white/40" : "bg-white/10 hover:bg-white/15")}
                    title="Read from GRID row7/row8 col B"
                  >Grid (rows 7/8 B)</button>
                  <button
                    onClick={() => setSourcePref("totals")}
                    className={cls("px-3 py-1.5 rounded-lg text-sm", sourcePref==="totals" ? "bg-white/20 ring-1 ring-white/40" : "bg-white/10 hover:bg-white/15")}
                    title="Read from totals.paid/totals.unpaid"
                  >Totals</button>
                  {health.mismatched && <Tag tone="error"><TriangleAlert size={14}/> grid≠totals</Tag>}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <div className="font-semibold mb-3 flex items-center gap-2"><Columns size={16}/> Columns</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {["email","phone","committee","portfolio","status"].map(k => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!cols[k]} onChange={() => setCols(c => ({...c, [k]: !c[k]}))} />
                    {k}
                  </label>
                ))}
              </div>
              <div className="font-semibold mt-4 mb-2 flex items-center gap-2"><Settings size={16}/> Privacy</div>
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={piiMask} onChange={() => setPiiMask(m=>!m)} /> Mask email & phone
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:col-span-2">
              <div className="font-semibold mb-3 flex items-center gap-2"><Settings size={16}/> KPI Cross-check</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="opacity-80 mb-1">Paid</div>
                  <div className="flex items-center gap-3">
                    <Tag>grid: {health.paid.grid ?? "—"}</Tag>
                    <Tag>totals: {health.paid.totals ?? "—"}</Tag>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="opacity-80 mb-1">Unpaid</div>
                  <div className="flex items-center gap-3">
                    <Tag>grid: {health.unpaid.grid ?? "—"}</Tag>
                    <Tag>totals: {health.unpaid.totals ?? "—"}</Tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Toasts */}
      <div className="fixed right-3 bottom-3 z-[10000] space-y-2">
        {toast.map(t => (
          <div key={t.id} className={cls("rounded-xl px-3 py-2 text-sm shadow-xl backdrop-blur-sm",
            t.tone==="error" ? "bg-red-600/30 ring-1 ring-red-500/50" :
            t.tone==="ok" ? "bg-emerald-600/30 ring-1 ring-emerald-500/50" :
            "bg-black/50 ring-1 ring-white/10"
          )}>
            <div className="flex items-center gap-2">
              {t.tone==="error" ? <ShieldAlert size={14}/> : t.tone==="ok" ? <CheckCircle2 size={14}/> : <Settings size={14}/>}
              <div>{t.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   Bits
   ========================================================================= */
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
      {Array.from({ length: 8 }).map((_, i) => (
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
