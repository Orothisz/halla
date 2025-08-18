// src/pages/Adminv1.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Download, Search, RefreshCw, BadgeCheck, Clock3, AlertCircle,
  History as HistoryIcon, Edit3, Wifi, WifiOff, ShieldAlert, CheckCircle2,
  Copy, ChevronLeft, ChevronRight, Eye, EyeOff, Columns, Settings, TriangleAlert,
  Users, CheckSquare, Square, Wand2, ChartNoAxesGantt, Filter, SlidersHorizontal,
  Globe, MonitorSmartphone, Smartphone, Trash2, Menu, X
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { LOGO_URL } from "../shared/constants";

/* ====================== Utilities ====================== */
const cls = (...xs) => xs.filter(Boolean).join(" ");
const safe = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));
const S = (v) => safe(v).toLowerCase().trim();
const numify = (x) => { const n = Number(String(x ?? "").replace(/[^\d.-]/g, "")); return Number.isFinite(n) ? n : 0; };
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||"").trim());
const phoneOk = (p) => /^[0-9+\-\s().]{6,}$/.test(String(p||"").trim());
const OUT_TO_UI = (out) => (String(out||"").toLowerCase()==="verified" ? "paid"
  : String(out||"").toLowerCase()==="rejected" ? "rejected" : "unpaid");
const UI_TO_OUT = (ui) => ui === "paid" ? "verified" : ui === "rejected" ? "rejected" : "pending";
const nowISO = () => new Date().toISOString().replace(/\.\d+Z$/,"Z");
function useDebounced(v, d=160){ const [x,setX]=useState(v); useEffect(()=>{const t=setTimeout(()=>setX(v),d); return()=>clearTimeout(t)},[v,d]); return x; }
const qp = () => { try{ return new URLSearchParams(window.location.search); }catch{ return new URLSearchParams(); } };

/* fold accents, collapse spaces, strip punctuation; also expose digits */
const fold = (s) => S(s)
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[._\-+/()]/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const digits = (s) => String(s||"").replace(/\D/g,"");

/* ---------- Query parser with field filters ---------- */
function parseQuery(q) {
  const out = { must: [], not: [], phrases: [], kv: {} };
  if (!q) return out;
  const re = /(?:"([^"]+)")|(\S+)/g;
  let m;
  while ((m = re.exec(q))) {
    const raw = m[1] ?? m[2] ?? "";
    if (!raw) continue;

    const neg = raw.startsWith("-");
    const body = neg ? raw.slice(1) : raw;

    const colon = body.indexOf(":");
    if (colon > 0) {
      const keyRaw = body.slice(0, colon);
      const valRaw = body.slice(colon + 1);
      const key = fold(keyRaw)
        .replace(/^is$/, "status")
        .replace(/^comm(itee)?$/, "committee")
        .replace(/^port(folio)?$/, "portfolio")
        .replace(/^mail|email$/, "email")
        .replace(/^tel|mobile|phone$/, "phone");
      const val = fold(valRaw.replace(/^"(.*)"$/, "$1"));
      if (!out.kv[key]) out.kv[key] = [];
      (neg ? out.kv[key] : out.kv[key]).push(neg ? "-" + val : val); // preserve neg with leading "-"
      continue;
    }

    const val = fold(body);
    if (!val) continue;

    if (m[1]) {
      (neg ? out.not : out.phrases).push(val);
    } else {
      (neg ? out.not : out.must).push(val);
    }
  }
  return out;
}

/* ================= Background ornament ================= */
function RomanLayer() {
  const { scrollYProgress } = useScroll();
  const yLaurel = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const IMG_CENTER = "https://i.postimg.cc/66DGSKwH/Untitled-design-7.png";
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 opacity-[.14]"
        style={{backgroundImage:"radial-gradient(1100px 700px at 80% -10%, rgba(255,255,255,.16), rgba(0,0,0,0)), radial-gradient(900px 600px at 12% 20%, rgba(255,255,255,.11), rgba(0,0,0,0))"}}/>
      <motion.img src={IMG_CENTER} alt="" loading="lazy" decoding="async"
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-[4vh] w-[540px] max-w-[92vw] opacity-[.40] md:opacity-[.55] mix-blend-screen select-none -z-20"
        style={{ y: yLaurel, filter: "grayscale(55%) contrast(108%)" }}/>
    </>
  );
}

/* ================= Tiny UI bits ================= */
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
  return createPortal(<div className="fixed z-[9999]" style={{ top: box.top, left: box.left, width: box.width }}>{children}</div>, document.body);
}
function FancySelect({ value, onChange, options, className = "", disabled=false }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];
  return (
    <div className={"relative " + className}>
      <button ref={btnRef} type="button" disabled={disabled}
        className={cls("w-full justify-between px-3 py-2 rounded-xl text-sm outline-none inline-flex items-center gap-2",
          disabled ? "bg-white/20 opacity-60 cursor-not-allowed" : "bg-white/90 text-gray-900 hover:bg-white")}
        onClick={(e) => { e.stopPropagation(); if (!disabled) setOpen((v) => !v); }}>
        <span className="truncate">{current?.label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" className={open ? "rotate-180 transition" : "transition"}><path fill="currentColor" d="M7 10l5 5 5-5z" /></svg>
      </button>
      <PortalDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)}>
        <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl max-h-64 overflow-auto">
          {options.map((o) => (
            <button key={o.value} className={"w-full text-left px-3 py-2 hover:bg-gray-100 " + (o.value === value ? "bg-gray-100" : "")}
              onClick={(e) => { e.stopPropagation(); onChange(o.value); setOpen(false); }}>
              {o.label}
            </button>
          ))}
        </div>
      </PortalDropdown>
    </div>
  );
}
function InlineEdit({ value, onSave, placeholder = "—", disabled=false, validate }) {
  const [v, setV] = useState(value ?? ""); const [editing, setEditing] = useState(false);
  useEffect(() => setV(value ?? ""), [value]);
  if (disabled) return <span className="truncate">{value || <span className="opacity-60">{placeholder}</span>}</span>;
  if (!editing) return (
    <button className="w-full text-left truncate hover:underline decoration-dotted" onClick={() => setEditing(true)} title={value}>
      {value || <span className="opacity-60">{placeholder}</span>}
    </button>
  );
  const bad = validate ? !validate(v) : false;
  return (
    <input autoFocus className={cls("w-full px-2 py-1 rounded-lg outline-none", bad ? "bg-red-400/20 ring-1 ring-red-500" : "bg-white/10")}
      value={v} onChange={(e) => setV(e.target.value)}
      onBlur={() => { setEditing(false); if (v !== value && !bad) onSave(v); }}
      onKeyDown={(e) => {
        if (e.key === "Enter") { setEditing(false); if (v !== value && !bad) onSave(v); }
        if (e.key === "Escape") { setEditing(false); setV(value ?? ""); }
      }}/>
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
  const raw = String(text);
  const lower = fold(raw);
  let i = 0; const spans = [];
  let pos = 0;
  function nextHit(from) {
    let hit = { at: -1, len: 0 };
    tokens.forEach(t => {
      const p = lower.indexOf(t, from);
      if (p >= 0 && (hit.at < 0 || p < hit.at)) hit = { at: p, len: t.length };
    });
    return hit;
  }
  while (pos < raw.length) {
    const h = nextHit(pos);
    if (h.at < 0) { spans.push(<span key={i++}>{raw.slice(pos)}</span>); break; }
    if (h.at > pos) spans.push(<span key={i++}>{raw.slice(pos, h.at)}</span>);
    spans.push(<mark key={i++} className="bg-yellow-500/30 rounded">{raw.slice(h.at, h.at + h.len)}</mark>);
    pos = h.at + h.len;
  }
  return <>{spans}</>;
}

/* ========================= Page ========================= */
export default function Adminv1() {
  /* Session / RBAC */
  const [me, setMe] = useState({ id: null, email: "", name: "" });
  useEffect(() => { (async () => {
    try {
      const { data: s } = await supabase.auth.getSession();
      const user = s?.session?.user;
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
        setMe({ id: user.id, email: user.email, name: prof?.full_name || user.user_metadata?.name || (user.email ? user.email.split("@")[0] : "admin") });
      }
    } catch {}
  })(); }, []);
  const adminList = useMemo(() => (import.meta.env.VITE_ADMIN_EMAILS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean), []);
  const canEdit = !!me.id && (adminList.length ? adminList.includes((me.email||"").toLowerCase()) : true);

  /* Endpoint discovery */
  const Q = qp();
  const envApi = (import.meta.env.VITE_DAPRIVATE_API_URL || import.meta.env.VITE_DAPRIVATE_JSON_URL || "").trim();
  const envDc  = (import.meta.env.VITE_DELCOUNT_JSON_URL || import.meta.env.VITE_DELCOUNT_API_URL || "").trim();
  const [apiUrl, setApiUrl] = useState(Q.get("api") || envApi);
  const [dcUrl,  setDcUrl ] = useState(Q.get("dc")  || envDc);

  /* ================== State / data ================== */
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [q, setQ] = useState(""); const qDeb = useDebounced(q, 160);
  const [status, setStatus] = useState("all");
  const [committee, setCommittee] = useState("all");
  const [tab, setTab] = useState("delegates");
  const [live, setLive] = useState(true);
  const [logs, setLogs] = useState([]); const [logsLoading, setLogsLoading] = useState(false);
  const [kpi, setKpi] = useState({ total: 0, paid: 0, unpaid: 0, rejected: 0 });
  const [kpiStale, setKpiStale] = useState(false);
  const [lastSynced, setLastSynced] = useState("");
  const [piiMask, setPiiMask] = useState(true);
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [cols, setCols] = useState({ email:true, phone:true, committee:true, portfolio:true, status:true });
  const [sourcePref, setSourcePref] = useState("totals");
  const [toast, setToast] = useState([]);
  const [compact, setCompact] = useState(true);
  const [lastDa, setLastDa] = useState(null);
  const [health, setHealth] = useState({ da: null, dc: null, mismatched: false, paid: {grid:null, totals:null}, unpaid: {grid:null, totals:null} });
  const [mobileOpen, setMobileOpen] = useState(false); // hamburger

  /* ===== KPI compute ===== */
  const computeKPI = useCallback((dcJson) => {
    const grid = Array.isArray(dcJson?.grid) ? dcJson.grid : null;
    const B = (row1) => numify(grid?.[row1-1]?.[1]);
    let g = { total:null, paid:null, unpaid:null };
    if (grid) { g.total=B(6); g.paid=B(7); g.unpaid=B(8); if (!g.total && (g.paid!=null || g.unpaid!=null)) g.total=(g.paid||0)+(g.unpaid||0); }
    const t = { total:numify(dcJson?.totals?.delegates)||null, paid:numify(dcJson?.totals?.paid)||null, unpaid:numify(dcJson?.totals?.unpaid)||null };
    const rejected = numify(dcJson?.totals?.cancellations) || 0;
    const src = sourcePref === "totals" ? t : g;
    const next = { total:src.total??t.total??g.total??0, paid:src.paid??t.paid??g.paid??0, unpaid:src.unpaid??t.unpaid??g.unpaid??0, rejected };
    const mismatch = (g.paid!=null && t.paid!=null && g.paid!==t.paid) || (g.unpaid!=null && t.unpaid!=null && g.unpaid!==t.unpaid);
    setHealth(h => ({ ...h, mismatched: !!mismatch, paid:{grid:g.paid, totals:t.paid}, unpaid:{grid:g.unpaid, totals:t.unpaid} }));
    return next;
  }, [sourcePref]);

  /* Robust fetch + tolerant JSON */
  async function fetchWithBackoff(url, opts, tries=[450,1000,2000]) {
    const t0 = performance.now();
    try {
      const u = `${url}${url.includes("?")?"&":"?"}t=${Date.now()}`;
      const r = await fetch(u, { cache:"no-store", ...opts });
      const ms = Math.round(performance.now()-t0);
      const txt = await r.text();
      let json = null; try{ json = JSON.parse(txt); }catch{}
      return { ok:r.ok && !!json, ms, json, status:r.status, raw: txt };
    } catch {
      if (tries.length) { await new Promise(res=>setTimeout(res, tries[0])); return fetchWithBackoff(url, opts, tries.slice(1)); }
      return { ok:false, ms:0, json:null, status:0, raw:null };
    }
  }

  /* ---------- CI field picker ---------- */
  const pick = (obj, names) => {
    for (const n of names) if (obj && obj[n] != null && obj[n] !== "") return obj[n];
    if (!obj) return "";
    const keys = Object.keys(obj);
    for (const n of names) { const k = keys.find(k => k.toLowerCase() === String(n).toLowerCase()); if (k && obj[k] != null && obj[k] !== "") return obj[k]; }
    return "";
  };

  /* Normalizers (build folded index + digits + tokens) */
  const normalizeRows = useCallback((arr) => {
    const norm = (arr || [])
      .filter(r => r && (pick(r,["full_name","Full Name","Name","name"]) ||
                         pick(r,["email","Email"]) ||
                         pick(r,["phone","Phone","phone no.","Phone No.","phone_no","Mobile","mobile","Contact","Contact Number"])))
      .map((r, i) => {
        const paidRaw = String(
          pick(r,["paid","Paid","paid?","Paid?","payment_status","Payment Status","status","Status"]) ?? ""
        ).toLowerCase();

        const canonical =
          paidRaw.includes("cancel") || paidRaw === "cancelled" ? "rejected" :
          paidRaw.includes("paid")   || paidRaw === "yes"       ? "paid"     :
          OUT_TO_UI(paidRaw);

        const out = {
          id: Number(pick(r,["id","ID","sno","S.No","S no","s_no"])) || i + 1,
          full_name: pick(r,["full_name","Full Name","Name","name"]) || "",
          email: pick(r,["email","Email"]) || "",
          phone: pick(r,["phone","Phone","phone no.","Phone No.","phone_no","Mobile","mobile","Contact","Contact Number"]) || "",
          alt_phone: pick(r,["alt_phone","Alt Phone","alternate","Alternate","Alternate Phone"]) || "",
          committee_pref1: pick(r,[
            "committee_pref1","Committee Pref1","committee","Committee",
            "committee 1","Committee 1","committee_preference_1","Committee Preference 1"
          ]) || "",
          portfolio_pref1: pick(r,[
            "portfolio_pref1","Portfolio Pref1","portfolio","Portfolio","portfolio 1","Portfolio 1"
          ]) || "",
          mail_sent: pick(r,["mail_sent","Mail Sent","mail sent","Mail sent","email_sent","Email Sent"]) || "",
          payment_status: canonical || "unpaid",
        };

        // include status text in the searchable slab
        const textIndex = [
          out.full_name, out.email, out.phone, out.alt_phone,
          out.committee_pref1, out.portfolio_pref1, out.payment_status
        ].filter(Boolean).join(" ");
        out._slab = fold(textIndex);
        out._digits = digits(out.phone + " " + out.alt_phone);
        out._tokens = out._slab.split(" ").filter(Boolean);
        return out;
      });

    const setC = new Set();
    norm.forEach((r) => r.committee_pref1 && setC.add(r.committee_pref1));
    setCommittees(Array.from(setC).sort((a,b)=>fold(a).localeCompare(fold(b))));
    return norm;
  }, []);

  /* Fetchers */
  async function fetchAll({ silent=false } = {}) {
    if (!silent) setLoading(true);
    setKpiStale(false);

    const allow = (u)=>typeof u==="string" && /^https?:\/\//i.test(u);

    let da = { ok:false, ms:0, json:null, status:0 };
    if (allow(apiUrl)) {
      da = await fetchWithBackoff(apiUrl, { method:"GET" });
      setHealth(h=>({ ...h, da }));
      if (da.ok) {
        setLastDa(da.json);
        const rowsIn =
          Array.isArray(da.json.rows)  ? da.json.rows  :
          Array.isArray(da.json.data)  ? da.json.data  :
          Array.isArray(da.json.items) ? da.json.items :
          Array.isArray(da.json?.result?.rows) ? da.json.result.rows : [];
        setRows(normalizeRows(rowsIn));
      }
    } else {
      setHealth(h=>({ ...h, da:{ ok:false, ms:0, status:0 }}));
      setRows([]); setLastDa({ ok:false, error:"DAPrivate URL missing" });
    }

    let dc = { ok:false, ms:0, json:null, status:0 };
    if (allow(dcUrl)) {
      dc = await fetchWithBackoff(dcUrl, { method:"GET" });
      setHealth(h=>({ ...h, dc }));
      if (dc.ok) {
        setKpi(computeKPI(dc.json));
        const committeesJson = dc.json?.committees || {};
        const entries = Array.isArray(committeesJson)
          ? committeesJson
          : Object.keys(committeesJson).map((name) => ({ name, ...committeesJson[name] }));
        const bd = (entries || []).map((c)=>({
          name: c.name || c.committee || "",
          total: Number(c.total)||0,
          paid: Number(c.paid)||0,
          unpaid: Number(c.unpaid)||0,
        })).sort((a,b)=>b.total-a.total);
        setBreakdown(bd);
      } else {
        setKpiStale(true);
      }
    } else {
      setHealth(h=>({ ...h, dc:{ ok:false, ms:0, status:0 }}));
      setKpiStale(true);
    }

    setLastSynced(nowISO());
    if (!silent) setLoading(false);
  }
  useEffect(()=>{ fetchAll(); /* eslint-disable-next-line */},[apiUrl,dcUrl]);
  useEffect(()=>{ if (!live) return; const t=setInterval(()=>fetchAll({silent:true}),25000); return ()=>clearInterval(t); }, [live, apiUrl, dcUrl]);
  useEffect(()=>{ setPage(1); }, [qDeb, status, committee]);

  /* ===== SMART SEARCH ===== */
  const qFolded = fold(qDeb);
  const query = useMemo(() => parseQuery(qFolded), [qFolded]);

  // fast small Levenshtein with early exit
  function lev(a, b, max=2){
    if (a===b) return 0;
    const al=a.length, bl=b.length;
    if (Math.abs(al-bl) > max) return max+1;
    const v0 = new Array(bl+1); const v1 = new Array(bl+1);
    for (let j=0;j<=bl;j++) v0[j]=j;
    for (let i=0;i<al;i++){
      v1[0]=i+1;
      let best=v1[0];
      for (let j=0;j<bl;j++){
        const cost = a[i]===b[j] ? 0 : 1;
        v1[j+1] = Math.min(v1[j]+1, v0[j+1]+1, v0[j]+cost);
        if (v1[j+1] < best) best = v1[j+1];
      }
      if (best > max) return max+1;
      for (let j=0;j<=bl;j++) v0[j]=v1[j];
    }
    return v1[bl];
  }

  function fuzzyTokenHit(row, token){
    // digits: match against phone digits only
    if (/\d/.test(token)) {
      const td = token.replace(/\D/g,"");
      if (!td) return { hit:false, score:0 };
      if (row._digits.includes(td)) return { hit:true, score:3 };
      return { hit:false, score:0 };
    }

    // direct include
    if (row._slab.includes(token)) {
      let s = 2;
      // boost if any word starts with token
      if (row._tokens.some(w => w.startsWith(token))) s += 2;
      // extra boost if name starts with it
      const nameFold = fold(row.full_name);
      if (nameFold.startsWith(token)) s += 3;
      return { hit:true, score:s };
    }

    // fuzzy within row tokens (edit distance <=1 for short, <=2 for long)
    const max = token.length <= 4 ? 1 : 2;
    for (const w of row._tokens) {
      if (Math.abs(w.length - token.length) > max) continue;
      if (lev(w, token, max) <= max) return { hit:true, score:1 };
    }
    return { hit:false, score:0 };
  }

  // apply UI filters + query filters + smart token/phrase matching; compute score
  const scoredVisible = useMemo(() => {
    const must = query.must, not = query.not, phrases = query.phrases, kv = query.kv;
    const hasAny = Boolean(must.length || not.length || phrases.length || Object.keys(kv).length);

    function kvPass(r){
      let ok = true;
      for (const k of Object.keys(kv)) {
        for (const raw of kv[k]) {
          const neg = raw.startsWith("-");
          const val = neg ? raw.slice(1) : raw;
          let hit = true;

          if (k==="status") hit = fold(r.payment_status) === val;
          else if (k==="committee") hit = fold(r.committee_pref1).includes(val);
          else if (k==="portfolio") hit = fold(r.portfolio_pref1).includes(val);
          else if (k==="email") {
            const f = fold(r.email);
            hit = f.includes(val) || (val.includes("@") ? f.endsWith(val) : f.includes(val));
          }
          else if (k==="phone") hit = r._digits.includes(val.replace(/\D/g,""));
          else if (k==="name")  hit = fold(r.full_name).includes(val);
          else if (k==="id")    hit = String(r.id) === val;

          if (neg ? hit : !hit) { ok=false; break; }
        }
        if (!ok) break;
      }
      return ok;
    }

    const out = [];
    for (const r of rows) {
      // UI dropdown filters first
      const statusOk = status==="all" ? true : S(r.payment_status)===status;
      const commOk = committee==="all" ? true : fold(r.committee_pref1)===fold(committee);
      if (!statusOk || !commOk) continue;

      if (!hasAny) { out.push({row:r, score:0}); continue; }

      if (!kvPass(r)) continue;

      // phrases are required
      let score = 0;
      let failed = false;
      for (const p of phrases) {
        if (!r._slab.includes(p)) { failed=true; break; }
        score += 6; // strong boost on phrase hit
      }
      if (failed) continue;

      // negatives
      for (const t of not) { if (r._slab.includes(t)) { failed=true; break; } }
      if (failed) continue;

      // must tokens with fuzzy allowance
      for (const t of must) {
        const res = fuzzyTokenHit(r, t);
        if (!res.hit) { failed=true; break; }
        score += res.score;
      }
      if (failed) continue;

      // small extra feature-based boosts
      if (qFolded && fold(r.full_name).includes(qFolded)) score += 1;
      if (qFolded && r.email && fold(r.email).includes(qFolded)) score += 1;

      out.push({ row: r, score });
    }

    // rank best matches first
    out.sort((a,b)=>b.score-a.score || a.row.id - b.row.id);
    return out;
  }, [rows, query, status, committee, qFolded]);

  const visible = scoredVisible.map(x=>x.row);

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageClamped = Math.min(Math.max(1,page), totalPages);
  const start = (pageClamped-1)*pageSize;
  const pageRows = visible.slice(start, start+pageSize);

  /* Selection */
  const allOnPageSelected = pageRows.length>0 && pageRows.every(r=>selectedIds.has(r.id));
  const toggleRowSel = (id) => setSelectedIds(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });
  const togglePageSel = () => setSelectedIds(s => { const n=new Set(s); if (allOnPageSelected) pageRows.forEach(r=>n.delete(r.id)); else pageRows.forEach(r=>n.add(r.id)); return n; });

  /* Toasts & Undo */
  const addToast=(text,tone="default",ms=3000)=>{const id=Math.random().toString(36).slice(2); setToast(t=>[...t,{id,text,tone}]); if(ms) setTimeout(()=>setToast(t=>t.filter(x=>x.id!==id)),ms);};
  const undoQ=useRef([]); const queueUndo=(rowId,prev)=>{const timer=setTimeout(()=>{undoQ.current=undoQ.current.filter(x=>x.rowId!==rowId)},10000); undoQ.current.push({rowId,prev,timer}); addToast(<span>Saved. <button className="underline" onClick={()=>doUndo(rowId)}>Undo</button></span>,"ok",10000);};
  async function doUndo(rowId){const i=undoQ.current.findIndex(x=>x.rowId===rowId); if(i<0) return; const {prev,timer}=undoQ.current[i]; clearTimeout(timer); undoQ.current.splice(i,1); await saveRow(prev, prev, true);}

  /* Save (inline) + bulk  */
  async function saveRow(row, patch, isUndo=false){
    if (!apiUrl){ addToast("DAPrivate URL missing","error"); return; }
    if (patch.email!=null && patch.email!==row.email && patch.email && !emailOk(patch.email)) return addToast("Invalid email","error");
    if (patch.phone!=null && patch.phone!==row.phone && patch.phone && !phoneOk(patch.phone)) return addToast("Invalid phone","error");

    const next={...row,...patch};
    next._slab = fold([next.full_name,next.email,next.phone,next.alt_phone,next.committee_pref1,next.portfolio_pref1,next.payment_status].join(" "));
    next._digits = digits(next.phone + " " + next.alt_phone);
    next._tokens = next._slab.split(" ").filter(Boolean);
    setRows(rs=>rs.map(x=>x.id===row.id?next:x)); // optimistic

    try{
      const res=await fetch(apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        action:"update", id:row.id, fields:{
          full_name:next.full_name, email:next.email, phone:next.phone, alt_phone:next.alt_phone,
          committee_pref1:next.committee_pref1, portfolio_pref1:next.portfolio_pref1,
          payment_status: patch.payment_status!=null ? UI_TO_OUT(patch.payment_status) : undefined,
        }
      })});
      const json=await res.json().catch(()=>({}));
      if(!res.ok || json?.ok===false) throw new Error(json?.error || `HTTP ${res.status}`);
      if(!isUndo) queueUndo(row.id,row);
      if (me.id){ try{ await supabase.from("admin_edit_logs").insert({
        actor_id: me.id, actor_email: me.email, row_id: row.id,
        field: Object.keys(patch)[0], old_value: safe(row[Object.keys(patch)[0]]), new_value: safe(next[Object.keys(patch)[0]]),
      }); }catch{} }
      fetchAll({silent:true});
    }catch(e){
      setRows(rs=>rs.map(x=>x.id===row.id?row:x)); addToast("Update failed","error");
    }
  }
  async function bulkStatus(newStatus){
    const ids=Array.from(selectedIds); if(!ids.length) return;
    addToast(`Updating ${ids.length} rows…`,"default",2000);
    for (const id of ids){
      const r=rows.find(x=>x.id===id);
      if(r) // eslint-disable-next-line no-await-in-loop
        await saveRow(r,{payment_status:newStatus});
    }
    setSelectedIds(new Set());
    addToast("Bulk update complete","ok");
  }

  /* Logs */
  async function loadLogs(){ setLogsLoading(true); try{
    const { data } = await supabase.from("admin_edit_logs").select("*").order("created_at",{ascending:false}).limit(300);
    setLogs(data||[]);
  } finally { setLogsLoading(false); } }
  useEffect(()=>{ if(tab==="history") loadLogs(); },[tab]);

  /* ======================= Render ======================= */
  const logo = LOGO_URL || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' rx='12' fill='%23fff'/><text x='50%' y='56%' text-anchor='middle' font-family='sans-serif' font-size='28' fill='%23000'>N</text></svg>";
  const needSetup = !apiUrl && !dcUrl;

  const ActionsBlock = (
    <>
      <Tag title="Last synced">{lastSynced ? <><CheckCircle2 size={14}/> {lastSynced}</> : "—"}</Tag>
      {kpiStale && <Tag tone="warn" title="DelCount unavailable; showing cached KPIs"><ShieldAlert size={14}/> stale</Tag>}
      {health.mismatched && <Tag tone="error" title={`grid≠totals (paid ${health.paid.grid} vs ${health.paid.totals}, unpaid ${health.unpaid.grid} vs ${health.unpaid.totals})`}><TriangleAlert size={14}/> KPI mismatch</Tag>}
      <button onClick={()=>fetchAll()} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"><RefreshCw size={16}/> Refresh</button>
      <button onClick={()=>{
        const headers=["id","full_name","email","phone","alt_phone","committee_pref1","portfolio_pref1","mail_sent","payment_status"];
        const csv=[headers.join(","), ...visible.map(r=>headers.map(h=>JSON.stringify(r[h]??"")).join(","))].join("\n");
        const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob);
        const a=document.createElement("a"); a.href=url; a.download=`delegates_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
      }} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"><Download size={16}/> Export CSV</button>
      <button onClick={()=>setLive(v=>!v)} className={cls("px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2",
        live ? "bg-emerald-500/20 hover:bg-emerald-500/25 text-emerald-200" : "bg-white/10 hover:bg-white/15")}
        title={live?"Live sync ON (25s)":"Live sync OFF"}>
        {live ? <Wifi size={16}/> : <WifiOff size={16}/> } Live
      </button>
      <button onClick={()=>setTab(t=>t==="health"?"delegates":"health")} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2" title="Data health"><ChartNoAxesGantt size={16}/> {tab==="health"?"Delegates":"Health"}</button>
      <button onClick={()=>setCompact(c=>!c)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2" title="Toggle layout">
        {compact ? <MonitorSmartphone size={16}/> : <Smartphone size={16}/>}{compact ? "Cards" : "Table"}
      </button>
    </>
  );

  return (
    <div className="relative min-h-[100dvh] text-white">
      <RomanLayer />

      {/* Top bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Noir" className="h-8 w-8 rounded-lg ring-1 ring-white/10" />
            <div>
              <div className="text-base font-semibold">Admin • Dashboard</div>
              <div className="text-xs opacity-70">hi, {me.name || "admin"} {canEdit ? <Tag tone="ok">editor</Tag> : <Tag>viewer</Tag>}</div>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            {ActionsBlock}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15"
            onClick={()=>setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18}/>
          </button>
        </div>
      </header>

      {/* Mobile slide-over menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[10000]">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[84vw] max-w-xs bg-black/90 border-l border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Menu</div>
              <button className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15" onClick={()=>setMobileOpen(false)} aria-label="Close menu">
                <X size={16}/>
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">{ActionsBlock}</div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-xs opacity-70 mb-2">Quick Tabs</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>{setTab("delegates"); setMobileOpen(false);}} className={cls("px-3 py-2 rounded-xl", tab==="delegates"?"bg-white/20":"bg-white/10 hover:bg-white/15")}>Delegates</button>
                  <button onClick={()=>{setTab("history"); setMobileOpen(false);}}   className={cls("px-3 py-2 rounded-xl", tab==="history"  ?"bg-white/20":"bg-white/10 hover:bg-white/15")}>History</button>
                  <button onClick={()=>{setTab("health"); setMobileOpen(false);}}    className={cls("px-3 py-2 rounded-xl", tab==="health"   ?"bg-white/20":"bg-white/10 hover:bg-white/15")}>Health</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup panel */}
      {needSetup && (
        <main className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-5 space-y-3">
            <div className="font-semibold flex items-center gap-2"><Globe size={16}/> Connect to Apps Script</div>
            <div className="grid gap-3">
              <label className="text-sm">
                DAPrivate (Rows) URL
                <input value={apiUrl} onChange={(e)=>setApiUrl(e.target.value)} placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 outline-none" />
              </label>
              <label className="text-sm">
                DelCount (KPIs) URL
                <input value={dcUrl} onChange={(e)=>setDcUrl(e.target.value)} placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 outline-none" />
              </label>
              <div className="flex gap-2">
                <button onClick={()=>fetchAll()} className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/25 text-sm inline-flex items-center gap-2"><CheckCircle2 size={16}/> Save & Load</button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Tabs */}
      {!needSetup && (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="flex flex-wrap gap-2">
            <TabButton active={tab==="delegates"} onClick={()=>setTab("delegates")} icon={<Edit3 size={16}/>}>Delegates</TabButton>
            <TabButton active={tab==="history"} onClick={()=>setTab("history")} icon={<HistoryIcon size={16}/>}>History</TabButton>
            <TabButton active={tab==="health"} onClick={()=>setTab("health")} icon={<ShieldAlert size={16}/>}>Health</TabButton>
          </div>
        </div>
      )}

      {/* Delegates */}
      {!needSetup && tab==="delegates" && (
        <main className="mx-auto max-w-7xl px-4 py-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5">
            <KPI title="Total" value={kpi.total} tone="from-white/15 to-white/5" icon={<Users size={18}/>}/>
            <KPI title="Unpaid" value={kpi.unpaid} tone="from-yellow-500/25 to-yellow-500/10" icon={<Clock3 size={18}/>}/>
            <KPI title="Paid" value={kpi.paid} tone="from-emerald-500/25 to-emerald-500/10" icon={<BadgeCheck size={18}/>}/>
            <KPI title="Rejected" value={kpi.rejected} tone="from-red-500/25 to-red-500/10" icon={<AlertCircle size={18}/>}/>
          </div>

          {/* Committee breakdown */}
          {!!breakdown.length && (
            <div className="mb-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-white/10 sticky top-0 z-10">
                  <tr className="whitespace-nowrap"><Th>Committee</Th><Th className="text-right">Total</Th><Th className="text-right">Paid</Th><Th className="text-right">Unpaid</Th></tr>
                </thead>
                <tbody>
                  {breakdown.map(b=>(
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
              <input value={q} onChange={(e)=>setQ(e.target.value)}
                placeholder='Search: name, email, phone, committee, portfolio — supports quotes, -, and filters like status:paid committee:"IP - Photography"'
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 outline-none placeholder:text-white/60"/>
            </div>
            <div className="flex gap-2">
              <FancySelect value={status} onChange={setStatus}
                options={[{value:"all",label:"All statuses"},{value:"unpaid",label:"Unpaid"},{value:"paid",label:"Paid"},{value:"rejected",label:"Rejected"}]}
                className="flex-1"/>
              <FancySelect value={committee} onChange={setCommittee}
                options={[{value:"all",label:"All committees"}, ...committees.map(c=>({value:c,label:c}))]}
                className="flex-1"/>
            </div>
            <div className="flex items-center gap-2 justify-between lg:justify-end">
              <button onClick={()=>{setQ("");setStatus("all");setCommittee("all");}}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"><Filter size={16}/> Clear</button>
              <button onClick={()=>setCols(c=>({...c,email:!c.email,phone:!c.phone}))}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"><Columns size={16}/> Columns</button>
              <button onClick={()=>setPiiMask(m=>!m)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2">{piiMask?<EyeOff size={16}/>:<Eye size={16}/>}{piiMask?"Mask":"Unmask"}</button>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="mb-3 flex flex-wrap gap-2 items-center">
            <Tag><CheckSquare size={14}/> {selectedIds.size} selected</Tag>
            <button disabled={!canEdit||!selectedIds.size} onClick={()=>bulkStatus("paid")}
              className={cls("px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2", selectedIds.size&&canEdit?"bg-emerald-500/20 hover:bg-emerald-500/25":"bg-white/10 opacity-60 cursor-not-allowed")}>
              <BadgeCheck size={14}/> Mark Paid</button>
            <button disabled={!canEdit||!selectedIds.size} onClick={()=>bulkStatus("unpaid")}
              className={cls("px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2", selectedIds.size&&canEdit?"bg-yellow-500/20 hover:bg-yellow-500/25":"bg-white/10 opacity-60 cursor-not-allowed")}>
              <Clock3 size={14}/> Mark Unpaid</button>
            <button disabled={!canEdit||!selectedIds.size} onClick={()=>bulkStatus("rejected")}
              className={cls("px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2", selectedIds.size&&canEdit?"bg-red-500/20 hover:bg-red-500/25":"bg-white/10 opacity-60 cursor-not-allowed")}>
              <AlertCircle size={14}/> Mark Rejected</button>

            <div className="ml-auto inline-flex items-center gap-2">
              <SlidersHorizontal size={16} className="opacity-70"/><span className="text-sm opacity-80">Rows per page</span>
              <FancySelect value={String(pageSize)} onChange={(v)=>setPageSize(Number(v))}
                options={[{value:"25",label:"25"},{value:"50",label:"50"},{value:"100",label:"100"}]} className="w-[90px]"/>
            </div>
          </div>

          {/* Data view */}
          {compact ? (
            <CardsMobile
              loading={loading}
              pageRows={pageRows}
              selectedIds={selectedIds}
              toggleRowSel={toggleRowSel}
              canEdit={canEdit}
              piiMask={piiMask}
              highlightTokens={[...query.must, ...query.phrases]}
              saveRow={saveRow}
            />
          ) : (
            <TableDesktop
              loading={loading}
              pageRows={pageRows}
              cols={cols}
              selectedIds={selectedIds}
              allOnPageSelected={allOnPageSelected}
              toggleRowSel={toggleRowSel}
              togglePageSel={togglePageSel}
              canEdit={canEdit}
              piiMask={piiMask}
              highlightTokens={[...query.must, ...query.phrases]}
              saveRow={saveRow}
            />
          )}

          {/* Debug if no rows */}
          {!loading && rows.length === 0 && (
            <div className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-3 text-xs">
              <div className="font-semibold mb-1">Debug · DAPrivate response snapshot</div>
              <pre className="overflow-auto max-h-64">{JSON.stringify(lastDa, null, 2)}</pre>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm opacity-80">Showing <b>{pageRows.length}</b> of <b>{visible.length}</b> (total <b>{rows.length}</b>)</div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50"
                onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={pageClamped<=1}><ChevronLeft size={16}/></button>
              <span className="text-sm">Page {pageClamped} / {totalPages}</span>
              <button className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50"
                onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={pageClamped>=totalPages}><ChevronRight size={16}/></button>
            </div>
          </div>
        </main>
      )}

      {/* History */}
      {!needSetup && tab==="history" && (
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="px-4 py-3 font-semibold">Edit History</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup><col className="w-[180px]"/><col className="w-[220px]"/><col className="w-20"/><col className="w-[160px]"/><col className="w-[320px]"/><col className="w-[320px]"/></colgroup>
                <thead className="bg-white/10 sticky top-0 z-10">
                  <tr className="whitespace-nowrap"><Th>Time</Th><Th>Actor</Th><Th>Row</Th><Th>Field</Th><Th>Old</Th><Th>New</Th></tr>
                </thead>
                <tbody>
                  {logsLoading ? <SkeletonRows cols={6}/> : (logs?.length||0)===0 ? (
                    <tr><td colSpan="6" className="p-8 text-center opacity-70">No edits yet.</td></tr>
                  ) : logs.map(l=>(
                    <tr key={l.id} className="border-t border-white/5 hover:bg-white/[0.04]">
                      <Td>{new Date(l.created_at).toLocaleString()}</Td>
                      <Td className="truncate" title={l.actor_email}>{l.actor_email}</Td>
                      <Td>{l.row_id}</Td><Td>{l.field}</Td>
                      <Td className="truncate" title={l.old_value}>{l.old_value}</Td>
                      <Td className="truncate" title={l.new_value}>{l.new_value}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* Health */}
      {!needSetup && tab==="health" && (
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <div className="font-semibold mb-3 flex items-center gap-2"><Settings size={16}/> Data Sources</div>
              <div className="space-y-2 text-sm">
                <HealthRow label="Registrations (DAPrivate)" obj={health.da}/>
                <HealthRow label="DelCount (KPIs)" obj={health.dc}/>
              </div>
              <div className="mt-4">
                <div className="font-semibold mb-2 flex items-center gap-2"><Wand2 size={16}/> KPI Source of Truth</div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setSourcePref("grid")}
                    className={cls("px-3 py-1.5 rounded-lg text-sm", sourcePref==="grid" ? "bg-white/20 ring-1 ring-white/40" : "bg-white/10 hover:bg-white/15")}
                    title="Read from GRID rows 6-8 col B">Grid (B6-B8)</button>
                  <button onClick={()=>setSourcePref("totals")}
                    className={cls("px-3 py-1.5 rounded-lg text-sm", sourcePref==="totals" ? "bg-white/20 ring-1 ring-white/40" : "bg-white/10 hover:bg-white/15")}
                    title="Read from totals.paid / totals.unpaid">Totals</button>
                  {health.mismatched && <Tag tone="error"><TriangleAlert size={14}/> grid≠totals</Tag>}
                </div>
                <div className="mt-4">
                  <div className="font-semibold mb-2 flex items-center gap-2"><Globe size={16}/> Endpoints</div>
                  <div className="grid gap-2 text-xs">
                    <input value={apiUrl} onChange={(e)=>setApiUrl(e.target.value)} placeholder="DAPrivate URL" className="px-2 py-1 rounded-lg bg-white/10 outline-none"/>
                    <input value={dcUrl} onChange={(e)=>setDcUrl(e.target.value)} placeholder="DelCount URL" className="px-2 py-1 rounded-lg bg-white/10 outline-none"/>
                    <div className="flex gap-2">
                      <button onClick={()=>fetchAll()} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"><RefreshCw size={14}/> Reload</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <div className="font-semibold mb-3 flex items-center gap-2"><Columns size={16}/> Columns & Privacy</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {["email","phone","committee","portfolio","status"].map(k=>(
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!cols[k]} onChange={()=>setCols(c=>({...c,[k]:!c[k]}))} /> {k}
                  </label>
                ))}
              </div>
              <div className="font-semibold mt-4 mb-2 flex items-center gap-2"><Settings size={16}/> Privacy</div>
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={piiMask} onChange={()=>setPiiMask(m=>!m)} /> Mask email & phone</label>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Toasts */}
      <div className="fixed right-3 bottom-3 z-[10000] space-y-2">
        {toast.map(t=>(
          <div key={t.id} className={cls("rounded-xl px-3 py-2 text-sm shadow-xl backdrop-blur-sm",
            t.tone==="error"?"bg-red-600/30 ring-1 ring-red-500/50":t.tone==="ok"?"bg-emerald-600/30 ring-1 ring-emerald-500/50":t.tone==="warn"?"bg-yellow-600/30 ring-1 ring-yellow-500/50":"bg-black/50 ring-1 ring-white/10")}>
            <div className="flex items-center gap-2">{t.tone==="error"?<ShieldAlert size={14}/>:t.tone==="ok"?<CheckCircle2 size={14}/>:t.tone==="warn"?<TriangleAlert size={14}/>:<Settings size={14}/>}{t.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Desktop table ===== */
function TableDesktop({loading,pageRows,cols,selectedIds,allOnPageSelected,toggleRowSel,togglePageSel,canEdit,piiMask,highlightTokens,saveRow}) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-12"/><col className="w-14"/><col className="w-[220px]"/>
          {cols.email && <col className="w-[260px]"/>}{cols.phone && <col className="w-[160px]"/>}
          {cols.committee && <col className="w-[200px]"/>}{cols.portfolio && <col className="w-[220px]"/>}
          {cols.status && <col className="w-[220px]"/>}
        </colgroup>
        <thead className="bg-white/10 sticky top-0 z-10">
          <tr className="whitespace-nowrap">
            <Th className="text-center">
              <button title={allOnPageSelected?"Unselect page":"Select page"} onClick={togglePageSel}>
                {allOnPageSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
              </button>
            </Th>
            <Th>ID</Th><Th>Name</Th>
            {cols.email && <Th>Email</Th>}{cols.phone && <Th>Phone</Th>}
            {cols.committee && <Th>Committee</Th>}{cols.portfolio && <Th>Portfolio</Th>}
            {cols.status && <Th>Status</Th>}
          </tr>
        </thead>
        <tbody>
          {loading ? <SkeletonRows cols={3 + (cols.email?1:0) + (cols.phone?1:0) + (cols.committee?1:0) + (cols.portfolio?1:0) + (cols.status?1:0)} />
          : pageRows.length===0 ? <tr><td colSpan="12" className="p-8 text-center opacity-70">No results match your filters.</td></tr>
          : pageRows.map(r=>(
            <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.04]">
              <Td className="text-center">
                <button onClick={()=>toggleRowSel(r.id)} title={selectedIds.has(r.id)?"Unselect":"Select"}>
                  {selectedIds.has(r.id) ? <CheckSquare size={16}/> : <Square size={16}/>}
                </button>
              </Td>
              <Td className="truncate">{r.id}</Td>
              <Td className="truncate" title={r.full_name}>
                <InlineEdit value={r.full_name} onSave={(v)=>saveRow(r,{full_name:v})} disabled={!canEdit}/>
              </Td>
              {cols.email && (
                <Td className="truncate" title={r.email}>
                  <div className="flex items-center gap-2">
                    <span className={piiMask ? "blur-[2px] hover:blur-0 transition" : ""}><Highlighter text={r.email} tokens={highlightTokens}/></span>
                    {!!r.email && (<>
                      <a className="opacity-70 hover:opacity-100 underline decoration-dotted" href={`mailto:${r.email}`}>mail</a>
                      <button title="Copy email" className="opacity-60 hover:opacity-100" onClick={()=>navigator.clipboard?.writeText(r.email)}><Copy size={14}/></button>
                    </>)}
                  </div>
                </Td>
              )}
              {cols.phone && (
                <Td className="truncate" title={r.phone}>
                  <div className="flex items-center gap-2">
                    <span className={piiMask ? "blur-[2px] hover:blur-0 transition" : ""}>{r.phone}</span>
                    {!!r.phone && (<>
                      <a className="opacity-70 hover:opacity-100 underline decoration-dotted" href={`https://wa.me/${r.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer">wa</a>
                      <button title="Copy phone" className="opacity-60 hover:opacity-100" onClick={()=>navigator.clipboard?.writeText(r.phone)}><Copy size={14}/></button>
                    </>)}
                  </div>
                </Td>
              )}
              {cols.committee && (<Td className="truncate" title={r.committee_pref1}><Highlighter text={r.committee_pref1} tokens={highlightTokens}/></Td>)}
              {cols.portfolio && (<Td className="truncate" title={r.portfolio_pref1}><Highlighter text={r.portfolio_pref1} tokens={highlightTokens}/></Td>)}
              {cols.status && (
                <Td>
                  <div className="flex items-center gap-2">
                    <StatusPill s={r.payment_status}/>
                    <div className="min-w-[120px]">
                      <FancySelect value={r.payment_status} onChange={(v)=>saveRow(r,{payment_status:v})}
                        options={[{value:"paid",label:"paid"},{value:"unpaid",label:"unpaid"},{value:"rejected",label:"rejected"}]} disabled={!canEdit}/>
                    </div>
                  </div>
                </Td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== Mobile cards ===== */
function CardsMobile({ loading, pageRows, selectedIds, toggleRowSel, canEdit, piiMask, highlightTokens, saveRow }) {
  if (loading) return <div className="grid gap-2">{Array.from({length:6}).map((_,i)=><div key={i} className="h-20 rounded-xl bg-white/10 animate-pulse"/>)}</div>;
  if (!pageRows.length) return <div className="p-8 text-center opacity-70">No results match your filters.</div>;
  return (
    <div className="grid gap-2">
      {pageRows.map(r=>(
        <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{r.full_name || "—"}</div>
              <div className="text-xs opacity-80 truncate">
                {piiMask ? <span className="blur-[2px] hover:blur-0 transition"><Highlighter text={r.email} tokens={highlightTokens}/></span> : <Highlighter text={r.email} tokens={highlightTokens}/>}
              </div>
              <div className="text-xs opacity-80 truncate">
                {piiMask ? <span className="blur-[2px] hover:blur-0 transition">{r.phone}</span> : r.phone}
              </div>
              <div className="text-xs mt-1">
                <span className="opacity-70"><Highlighter text={r.committee_pref1 || "—"} tokens={highlightTokens}/></span>
                {!!r.portfolio_pref1 && <span className="opacity-50"> • <Highlighter text={r.portfolio_pref1} tokens={highlightTokens}/></span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusPill s={r.payment_status}/>
              <button className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 inline-flex items-center gap-1" onClick={()=>toggleRowSel(r.id)}>
                {selectedIds.has(r.id) ? <><CheckSquare size={14}/> Selected</> : <><Square size={14}/> Select</>}
              </button>
            </div>
          </div>
          {canEdit && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/25 text-xs inline-flex items-center gap-1" onClick={()=>saveRow(r,{payment_status:"paid"})}><BadgeCheck size={14}/> Paid</button>
              <button className="px-2 py-1 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/25 text-xs inline-flex items-center gap-1" onClick={()=>saveRow(r,{payment_status:"unpaid"})}><Clock3 size={14}/> Unpaid</button>
              <button className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/25 text-xs inline-flex items-center gap-1" onClick={()=>saveRow(r,{payment_status:"rejected"})}><Trash2 size={14}/> Reject</button>
              <button className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs inline-flex items-center gap-1" onClick={()=>navigator.clipboard?.writeText([r.full_name,r.email,r.phone].filter(Boolean).join(" • "))}><Copy size={14}/> Copy</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ======================= Bits ======================= */
function TabButton({ active, onClick, children, icon }) {
  return <button onClick={onClick} className={cls("px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2", active?"bg-white/15":"bg-white/10 hover:bg-white/15")}>{icon} {children}</button>;
}
function KPI({ title, value, icon, tone="from-white/15 to-white/5" }) {
  return (
    <div className={cls("rounded-2xl border border-white/10 p-4 bg-gradient-to-br", tone)}>
      <div className="flex items-center justify-between"><div className="text-sm opacity-80">{title}</div><div className="opacity-80">{icon}</div></div>
      <div className="mt-2 text-2xl font-semibold">{Number.isFinite(value)?value:0}</div>
    </div>
  );
}
function Th({ children, className }) { return <th className={cls("text-left px-3 md:py-3 py-2 text-xs md:text-sm font-medium", className)}>{children}</th>; }
function Td({ children, className }) { return <td className={cls("px-3 md:py-3 py-2 text-xs md:text-sm align-middle whitespace-nowrap truncate", className)}>{children}</td>; }
function StatusPill({ s }) {
  const v=(s||"unpaid").toLowerCase();
  const tone = v==="paid" ? "bg-emerald-500/20 text-emerald-200" : v==="rejected" ? "bg-red-500/20 text-red-200" : "bg-yellow-500/20 text-yellow-200";
  return <span className={cls("px-2 py-1 rounded-lg text-xs", tone)}>{v}</span>;
}
function SkeletonRows({ cols=7 }){
  return (<>{Array.from({length:8}).map((_,i)=>(
    <tr key={i} className="border-t border-white/5">{Array.from({length:cols}).map((__,j)=>(
      <td key={j} className="px-3 py-3"><div className="h-4 rounded bg-white/10 animate-pulse"/></td>))}</tr>))}</>);
}
function HealthRow({ label, obj }) {
  const ok = !!obj?.ok;
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        {ok ? <Tag tone="ok"><CheckCircle2 size={14}/> OK</Tag> : <Tag tone="error"><ShieldAlert size={14}/> FAIL</Tag>}
        <Tag>{obj?.ms ?? "—"} ms</Tag>
        <Tag>HTTP {obj?.status ?? "—"}</Tag>
      </span>
    </div>
  );
}
