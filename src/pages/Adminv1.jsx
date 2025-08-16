// src/pages/Adminv1.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Filter, Search, Loader2, CheckCircle2, XCircle, Pencil,
  RefreshCw, BadgeCheck, AlertCircle, Clock3, ExternalLink, Phone, Mail, Building2, User2
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { LOGO_URL, THEME_HEX } from "../shared/constants";

/* ------------------------------ Aesthetic Background ------------------------------ */
/* Matches the premium vibe of Home.jsx: soft radial auras + ultra-light starfield */
function NoirBg() {
  const star = useRef(null);

  useEffect(() => {
    const c = star.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf = 0;

    function size() {
      c.width = innerWidth;
      c.height = innerHeight;
    }
    size();
    addEventListener("resize", size);

    const N = 110; // subtle count to keep perf snappy
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      v: Math.random() * 0.25 + 0.05,
      r: Math.random() * 0.7 + 0.2,
      a: Math.random() * Math.PI * 2,
    }));

    function loop() {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = "lighter";
      for (const p of pts) {
        p.y += p.v;
        p.x += Math.sin(p.a) * 0.15;
        p.a += 0.005;
        if (p.y > c.height + 5) p.y = -5;
        if (p.x < -5) p.x = c.width + 5;
        if (p.x > c.width + 5) p.x = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    };
  }, []);

  return (
    <>
      {/* Radial auras */}
      <div className="fixed inset-0 -z-30 bg-black" />
      <div className="fixed inset-0 -z-20 opacity-[.10] pointer-events-none"
           style={{
             backgroundImage: `
               radial-gradient(1200px 800px at 80% -20%, rgba(255,255,255,0.10), rgba(0,0,0,0)),
               radial-gradient(900px 600px at 10% 20%, rgba(255,255,255,0.08), rgba(0,0,0,0)),
               radial-gradient(700px 500px at 50% 110%, rgba(255,255,255,0.06), rgba(0,0,0,0))
             `
           }}
      />
      {/* Starfield */}
      <canvas ref={star} className="fixed inset-0 -z-10 opacity-[.25]"></canvas>

      {/* Grain for premium texture */}
      <div className="fixed inset-0 -z-[5] pointer-events-none opacity-[.07]"
           style={{ backgroundImage: "url('data:image/svg+xml;utf8,\
<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22>\
<filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter>\
<rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.15%22/></svg>')" }}
      />
    </>
  );
}

/* ------------------------------ Helpers ------------------------------ */
const cls = (...xs) => xs.filter(Boolean).join(" ");
const fmtDate = (s) => {
  try { return new Date(s).toLocaleString(); } catch { return s || ""; }
};
const STATUS = ["pending", "verified", "rejected"];

/* ------------------------------ Admin v1 ------------------------------ */
export default function Adminv1() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [committee, setCommittee] = useState("all");
  const [detail, setDetail] = useState(null); // selected row for drawer
  const [committees, setCommittees] = useState([]); // dynamically derived

  useEffect(() => {
    fetchRows();
  }, []);

  async function fetchRows() {
    setLoading(true);
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setRows(data || []);
      // derive committees for filter
      const setC = new Set();
      (data || []).forEach((r) => {
        if (r.committee_pref1) setC.add(r.committee_pref1);
        if (r.committee_pref2) setC.add(r.committee_pref2);
      });
      setCommittees(Array.from(setC).sort());
    }
    setLoading(false);
  }

  const counts = useMemo(() => {
    const c = { total: rows.length, pending: 0, verified: 0, rejected: 0 };
    rows.forEach((r) => {
      const s = (r.payment_status || "pending").toLowerCase();
      if (s === "verified") c.verified++;
      else if (s === "rejected") c.rejected++;
      else c.pending++;
    });
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      const s = (r.payment_status || "pending").toLowerCase();
      const com1 = (r.committee_pref1 || "").toLowerCase();
      const com2 = (r.committee_pref2 || "").toLowerCase();

      const hit =
        !qq ||
        (r.full_name || "").toLowerCase().includes(qq) ||
        (r.email || "").toLowerCase().includes(qq) ||
        (r.phone || "").toLowerCase().includes(qq) ||
        (r.institution || "").toLowerCase().includes(qq) ||
        com1.includes(qq) ||
        (r.portfolio_pref1 || "").toLowerCase().includes(qq) ||
        com2.includes(qq) ||
        (r.portfolio_pref2 || "").toLowerCase().includes(qq) ||
        (r.reference || "").toLowerCase().includes(qq);

      const passStatus = status === "all" ? true : s === status;
      const passCommittee =
        committee === "all"
          ? true
          : com1 === committee.toLowerCase() || com2 === committee.toLowerCase();

      return hit && passStatus && passCommittee;
    });
  }, [rows, q, status, committee]);

  function exportCSV() {
    const headers = [
      "id","created_at","full_name","email","phone","alt_phone","age","institution","experience","grade",
      "committee_pref1","portfolio_pref1","committee_pref2","portfolio_pref2",
      "co_delegate_details","questions","reference","payment_option","payment_status","payment_ref","notes"
    ];
    const csv = [
      headers.join(","),
      ...visible.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function updatePayment(id, newStatus) {
    setSavingId(id);
    const { error } = await supabase
      .from("registrations")
      .update({ payment_status: newStatus })
      .eq("id", id);
    setSavingId(null);
    if (!error) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, payment_status: newStatus } : r)));
      if (detail?.id === id) setDetail((d) => ({ ...d, payment_status: newStatus }));
    }
  }

  async function saveDetailField(id, field, value) {
    setSavingId(id);
    const { error } = await supabase
      .from("registrations")
      .update({ [field]: value })
      .eq("id", id);
    setSavingId(null);
    if (!error) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
      if (detail?.id === id) setDetail((d) => ({ ...d, [field]: value }));
    }
  }

  return (
    <div className="relative min-h-[100dvh] text-white">
      <NoirBg />

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
            <button
              onClick={fetchRows}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={exportCSV}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <KPI
            title="Total"
            value={counts.total}
            icon={<BadgeCheck size={18} />}
            tone="from-white/15 to-white/5"
          />
          <KPI
            title="Pending"
            value={counts.pending}
            icon={<Clock3 size={18} />}
            tone="from-yellow-500/25 to-yellow-500/10"
          />
          <KPI
            title="Verified"
            value={counts.verified}
            icon={<CheckCircle2 size={18} />}
            tone="from-emerald-500/25 to-emerald-500/10"
          />
          <KPI
            title="Rejected"
            value={counts.rejected}
            icon={<AlertCircle size={18} />}
            tone="from-red-500/25 to-red-500/10"
          />
        </div>

        {/* Controls */}
        <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 opacity-80" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone, institution, committee, reference…"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 outline-none placeholder:text-white/60"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-2.5 opacity-80" size={18} />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 outline-none appearance-none"
              >
                <option value="all">All statuses</option>
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-2.5 opacity-80" size={18} />
              <select
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 outline-none appearance-none"
              >
                <option value="all">All committees</option>
                {committees.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm opacity-70 lg:text-right self-center">
            Showing {visible.length} of {rows.length}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 sticky top-[54px] z-40">
                <tr>
                  <Th>ID</Th>
                  <Th>Date</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Institution</Th>
                  <Th>Committee 1</Th>
                  <Th>Portfolio 1</Th>
                  <Th>Status</Th>
                  <Th className="text-right pr-4">Action</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-8 text-center opacity-70">
                      No results match your filters.
                    </td>
                  </tr>
                ) : (
                  visible.map((r) => (
                    <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.04]">
                      <Td>{r.id}</Td>
                      <Td>{fmtDate(r.created_at ?? r.ts)}</Td>
                      <Td className="max-w-[220px] truncate" title={r.full_name}>
                        {r.full_name}
                      </Td>
                      <Td className="max-w-[260px] truncate" title={r.email}>
                        {r.email}
                      </Td>
                      <Td className="max-w-[160px] truncate" title={r.phone}>
                        {r.phone}
                      </Td>
                      <Td className="max-w-[240px] truncate" title={r.institution}>
                        {r.institution}
                      </Td>
                      <Td className="max-w-[200px] truncate" title={r.committee_pref1}>
                        {r.committee_pref1}
                      </Td>
                      <Td className="max-w-[200px] truncate" title={r.portfolio_pref1}>
                        {r.portfolio_pref1}
                      </Td>
                      <Td>
                        <StatusPill s={r.payment_status} />
                      </Td>
                      <Td className="text-right pr-3">
                        <div className="flex items-center justify-end gap-2">
                          <SmallBtn
                            onClick={() => updatePayment(r.id, "verified")}
                            disabled={savingId === r.id}
                            title="Mark Verified"
                          >
                            <CheckCircle2 size={16} />
                            Verify
                          </SmallBtn>
                          <SmallBtn
                            onClick={() => updatePayment(r.id, "rejected")}
                            disabled={savingId === r.id}
                            title="Mark Rejected"
                          >
                            <XCircle size={16} />
                            Reject
                          </SmallBtn>
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              setDetail(r);
                            }}
                            href={`/admin/registration/${r.id}`}
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 inline-flex items-center gap-1"
                            title="Open detail"
                          >
                            <Pencil size={14} />
                            Edit
                          </a>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Drawer */}
      <AnimatePresence>
        {detail && (
          <Drawer onClose={() => setDetail(null)}>
            <DetailCard
              row={detail}
              saving={savingId === detail.id}
              onStatus={(s) => updatePayment(detail.id, s)}
              onChange={(field, val) => saveDetailField(detail.id, field, val)}
            />
          </Drawer>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ UI Bits ------------------------------ */
function KPI({ title, value, icon, tone = "from-white/15 to-white/5" }) {
  return (
    <div
      className={cls(
        "rounded-2xl border border-white/10 p-4 bg-gradient-to-br",
        tone
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">{title}</div>
        <div className="opacity-80">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Th({ children, className }) {
  return (
    <th className={cls("text-left px-3 py-3 font-medium", className)}>{children}</th>
  );
}

function Td({ children, className }) {
  return <td className={cls("px-3 py-3 align-middle", className)}>{children}</td>;
}

function SmallBtn({ onClick, disabled, children, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function StatusPill({ s }) {
  const v = (s || "pending").toLowerCase();
  const tone =
    v === "verified"
      ? "bg-emerald-500/20 text-emerald-300"
      : v === "rejected"
      ? "bg-red-500/20 text-red-300"
      : "bg-yellow-500/20 text-yellow-300";
  return <span className={cls("px-2 py-1 rounded-lg", tone)}>{v}</span>;
}

function SkeletonRows() {
  const R = Array.from({ length: 7 });
  return (
    <>
      {R.map((_, i) => (
        <tr key={i} className="border-t border-white/5">
          {Array.from({ length: 10 }).map((__, j) => (
            <td key={j} className="px-3 py-3">
              <div className="h-4 rounded bg-white/10 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ------------------------------ Drawer & Detail ------------------------------ */
function Drawer({ children, onClose }) {
  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.28 }}
      className="fixed top-0 right-0 h-screen w-full max-w-[520px] bg-black/80 backdrop-blur-xl border-l border-white/10 z-[60]"
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
        <div className="font-semibold">Registration Detail</div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15"
        >
          Close
        </button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100vh-56px)]">{children}</div>
    </motion.aside>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-3 items-center">
      <div className="text-sm opacity-70">{label}</div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, as = "input", multilineRows = 3 }) {
  if (as === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={multilineRows}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl bg-white/10 outline-none placeholder:text-white/60"
      />
    );
  }
  return (
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl bg-white/10 outline-none placeholder:text-white/60"
    />
  );
}

function DetailCard({ row, saving, onStatus, onChange }) {
  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">{row.full_name}</div>
            <div className="text-xs opacity-70">ID #{row.id} • {fmtDate(row.created_at ?? row.ts)}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStatus("verified")}
              disabled={saving}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
              title="Mark Verified"
            >
              Verify
            </button>
            <button
              onClick={() => onStatus("rejected")}
              disabled={saving}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/25 disabled:opacity-50"
              title="Mark Rejected"
            >
              Reject
            </button>
          </div>
        </div>
        <div className="mt-3">
          <StatusPill s={row.payment_status} />
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2">
          <User2 size={16} /> Contact
        </div>
        <FieldRow label="Email">
          <div className="flex items-center gap-2">
            <Mail size={16} className="opacity-70" />
            <a className="underline decoration-dotted" href={`mailto:${row.email}`}>{row.email}</a>
          </div>
        </FieldRow>
        <FieldRow label="Phone">
          <div className="flex items-center gap-2">
            <Phone size={16} className="opacity-70" />
            <a className="underline decoration-dotted" href={`tel:${row.phone}`}>{row.phone}</a>
          </div>
        </FieldRow>
        {row.alt_phone && (
          <FieldRow label="Alt. Phone">
            <a className="underline decoration-dotted" href={`tel:${row.alt_phone}`}>{row.alt_phone}</a>
          </FieldRow>
        )}
        <FieldRow label="Institution">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="opacity-70" />
            <div>{row.institution}</div>
          </div>
        </FieldRow>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2">
          <ExternalLink size={16} /> Preferences
        </div>
        <FieldRow label="Committee 1">
          <Input
            value={row.committee_pref1}
            onChange={(v) => onChange("committee_pref1", v)}
            placeholder="Committee preference 1"
          />
        </FieldRow>
        <FieldRow label="Portfolio 1">
          <Input
            value={row.portfolio_pref1}
            onChange={(v) => onChange("portfolio_pref1", v)}
            placeholder="Portfolio preference 1"
          />
        </FieldRow>
        <FieldRow label="Committee 2">
          <Input
            value={row.committee_pref2}
            onChange={(v) => onChange("committee_pref2", v)}
            placeholder="Committee preference 2"
          />
        </FieldRow>
        <FieldRow label="Portfolio 2">
          <Input
            value={row.portfolio_pref2}
            onChange={(v) => onChange("portfolio_pref2", v)}
            placeholder="Portfolio preference 2"
          />
        </FieldRow>
      </div>

      {/* Payment & Notes */}
      <div className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-3">
        <div className="text-sm font-semibold">Payment</div>
        <FieldRow label="Option">
          <Input
            value={row.payment_option}
            onChange={(v) => onChange("payment_option", v)}
            placeholder="primary / alternative / UPI"
          />
        </FieldRow>
        <FieldRow label="Ref / Txn ID">
          <Input
            value={row.payment_ref}
            onChange={(v) => onChange("payment_ref", v)}
            placeholder="Transaction reference"
          />
        </FieldRow>
        <div className="h-px bg-white/10" />
        <div className="text-sm font-semibold">Admin Notes</div>
        <Input
          as="textarea"
          multilineRows={5}
          value={row.notes}
          onChange={(v) => onChange("notes", v)}
          placeholder="Internal notes (visible to admins only)"
        />
      </div>

      {/* Misc */}
      <div className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-2">
        <div className="text-sm font-semibold">Misc</div>
        <FieldRow label="Experience">
          <Input
            value={row.experience}
            onChange={(v) => onChange("experience", v)}
            placeholder="MUN experience (numbers)"
          />
        </FieldRow>
        <FieldRow label="Grade">
          <Input
            value={row.grade}
            onChange={(v) => onChange("grade", v)}
            placeholder="Grade in numerals"
          />
        </FieldRow>
        {row.co_delegate_details && (
          <FieldRow label="Co-Delegate">
            <Input
              as="textarea"
              value={row.co_delegate_details}
              onChange={(v) => onChange("co_delegate_details", v)}
              placeholder="Co-delegate details"
              multilineRows={4}
            />
          </FieldRow>
        )}
        {row.questions && (
          <FieldRow label="Questions">
            <Input
              as="textarea"
              value={row.questions}
              onChange={(v) => onChange("questions", v)}
              placeholder="Delegate questions"
              multilineRows={4}
            />
          </FieldRow>
        )}
        {row.reference && (
          <FieldRow label="Reference">
            <Input
              value={row.reference}
              onChange={(v) => onChange("reference", v)}
              placeholder="Reference (if any)"
            />
          </FieldRow>
        )}
      </div>
    </div>
  );
}
