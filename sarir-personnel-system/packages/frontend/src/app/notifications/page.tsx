"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */ // TODO: tighten notification types

import {
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Notif = {
  id: number | string;
  title: string;
  body?: string;
  category?: "hr" | "system" | "alert" | string;
  unread?: boolean;
  created_at?: string;
};

const glass = "rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow";
const rise = { hidden: { y: 18, opacity: 0 }, show: { y: 0, opacity: 1 } };

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs transition-all ${
        active ? "bg-[#0A8A9F] text-white" : "bg-black/5 hover:bg-black/10"
      }`}
    >
      {children}
    </button>
  );
}

function Badge({ cat }: { cat?: string }) {
  const map: Record<string, string> = {
    hr: "bg-emerald-500",
    system: "bg-slate-500",
    alert: "bg-rose-500",
  };
  const labelMap: Record<string, string> = {
    hr: "منابع انسانی",
    system: "سیستمی",
    alert: "هشدار",
  };
  const c = map[(cat || "").toLowerCase()] || "bg-sky-500";
  const l = labelMap[(cat || "").toLowerCase()] || (cat || "سایر");
  return (
    <span className={`px-2 py-0.5 text-[11px] rounded-full text-white ${c}`}>
      {l}
    </span>
  );
}

/* ---------------- Toast با Undo (بدون پکیج) ---------------- */
function useToast() {
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    onUndo?: () => void;
    onCommit?: () => void;
    ttl?: number;
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function show(
    message: string,
    {
      onUndo,
      onCommit,
      ttl = 5000,
    }: { onUndo?: () => void; onCommit?: () => void; ttl?: number } = {}
  ) {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = Date.now();
    setToast({ id, message, onUndo, onCommit, ttl });
    timerRef.current = setTimeout(() => {
      onCommit?.();
      setToast(null);
    }, ttl);
  }

  function undo() {
    if (!toast) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    toast.onUndo?.();
    setToast(null);
  }

  function dismiss() {
    if (!toast) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    toast.onCommit?.();
    setToast(null);
  }

  const element = toast ? (
    <div className="fixed bottom-5 inset-x-0 z-[60] flex justify-center px-3">
      <div className="max-w-xl w-full rounded-2xl bg-[#0A8A9F] text-white shadow-lg flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm">{toast.message}</span>
        <div className="flex items-center gap-2">
          {toast.onUndo && (
            <button
              onClick={undo}
              className="px-3 py-1.5 rounded-md bg-white/20 hover:bg-white/30 text-sm"
            >
              برگردان
            </button>
          )}
          <button
            onClick={dismiss}
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { show, element };
}

/* ---------------- ابزار تاریخ: گروه‌بندی روزانه ---------------- */
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function dayKey(d?: string) {
  if (!d) return "نامشخص";
  const dt = new Date(d);
  const today = startOfDay(new Date());
  const that = startOfDay(dt);
  const diff = Math.round((today.getTime() - that.getTime()) / 86400000);
  if (diff === 0) return "امروز";
  if (diff === 1) return "دیروز";
  try {
    return dt.toLocaleDateString("fa-IR");
  } catch {
    return d.slice(0, 10);
  }
}

export default function NotificationsPage() {
  const expanded = false;

  const [rows, setRows] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "unread" | "read">("all");
  const [cat, setCat] = useState<"all" | "hr" | "system" | "alert">("all");

  const [selected, setSelected] = useState<(number | string)[]>([]);
  const allSelected = useMemo(
    () => rows.length > 0 && selected.length === rows.length,
    [rows, selected]
  );

  const { show, element: toast } = useToast();

  const notifyUpdate = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notifications:update"));
    }
  };

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const r = await fetch("/api/notifications", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      const normalized: Notif[] = (Array.isArray(j) ? j : []).map(
        (n: any, i: number) => ({
          id: n.id ?? i + 1,
          title: n.title ?? n.subject ?? "اعلان بدون عنوان",
          body: n.body ?? n.message ?? "",
          category: (n.category || n.type || "").toLowerCase() as any,
          unread:
            n.unread ??
            (n.read === true ? false : n.status === "unread" ? true : undefined),
          created_at: n.created_at ?? n.date ?? n.timestamp ?? "",
        })
      );
      setRows(normalized);
    } catch (e: any) {
      setErr(e?.message || "خطا در دریافت اعلان‌ها");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggleOne(id: number | string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
  function toggleAll() {
    if (allSelected) setSelected([]);
    else setSelected(rows.map((r) => r.id));
  }

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status === "unread" && r.unread === false) return false;
      if (status === "read" && r.unread !== false) return false;
      if (cat !== "all" && (r.category || "").toLowerCase() !== cat) return false;
      if (k) {
        const text = `${r.title} ${r.body || ""} ${r.category || ""}`.toLowerCase();
        if (!text.includes(k)) return false;
      }
      return true;
    });
  }, [rows, q, status, cat]);

  const grouped = useMemo(() => {
    const map = new Map<string, Notif[]>();
    for (const n of filtered) {
      const key = dayKey(n.created_at);
      const arr = map.get(key) || [];
      arr.push(n);
      map.set(key, arr);
    }
    const keys = Array.from(map.keys());
    const todayIdx = keys.indexOf("امروز");
    const yestIdx = keys.indexOf("دیروز");
    const others = keys
      .filter((k) => k !== "امروز" && k !== "دیروز")
      .sort((a, b) => {
        const da = new Date(map.get(a)?.[0]?.created_at || 0).getTime();
        const db = new Date(map.get(b)?.[0]?.created_at || 0).getTime();
        return db - da;
      });
    const ordered = [
      ...(todayIdx >= 0 ? ["امروز"] : []),
      ...(yestIdx >= 0 ? ["دیروز"] : []),
      ...others,
    ];
    return { map, ordered };
  }, [filtered]);

  function markOne(id: Notif["id"], unread: boolean) {
    const prev = rows;
    setRows((rs) => rs.map((n) => (n.id === id ? { ...n, unread } : n)));

    show(unread ? "علامت «نخوانده» شد." : "علامت «خوانده شد» ثبت شد.", {
      onUndo: () => setRows(prev),
      onCommit: async () => {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, unread }),
        });
        notifyUpdate();
      },
    });
  }

  function deleteOne(id: Notif["id"]) {
    const prev = rows;
    setRows((rs) => rs.filter((n) => n.id !== id));

    show("حذف شد.", {
      onUndo: () => setRows(prev),
      onCommit: async () => {
        await fetch("/api/notifications", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        notifyUpdate();
      },
    });
  }

  async function bulkPatch(unread: boolean) {
    if (selected.length === 0) return;
    const prev = rows;
    setRows((rs) => rs.map((n) => (selected.includes(n.id) ? { ...n, unread } : n)));
    show(
      unread
        ? "علامت «نخوانده» برای موارد انتخابی ثبت شد."
        : "علامت «خوانده شد» برای موارد انتخابی ثبت شد.",
      {
        onUndo: () => setRows(prev),
        onCommit: async () => {
          const ops = selected.map((id) =>
            fetch("/api/notifications", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, unread }),
            })
          );
          await Promise.allSettled(ops);
          notifyUpdate();
        },
      }
    );
    setSelected([]);
  }

  async function bulkDelete() {
    if (selected.length === 0) return;
    const prev = rows;
    setRows((rs) => rs.filter((n) => !selected.includes(n.id)));
    show("حذف موارد انتخابی ثبت شد.", {
      onUndo: () => setRows(prev),
      onCommit: async () => {
        const ops = selected.map((id) =>
          fetch("/api/notifications", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          })
        );
        await Promise.allSettled(ops);
        notifyUpdate();
      },
    });
    setSelected([]);
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen text-slate-900 bg-gradient-to-br from-[#F2FAFD] via-[#E9F4FA] to-[#DDEEF7]"
    >
      <main
        className="flex-1 p-6 md:p-10 space-y-8 transition-all"
        style={{ paddingRight: expanded ? "256px" : "72px" }}
      >
        {/* Header */}
        <motion.header
          initial={rise.hidden}
          animate={rise.show}
          transition={{ duration: 0.45 }}
          className={`${glass} p-6`}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A8A9F] flex items-center gap-2">
            <BellAlertIcon className="h-7 w-7 text-[#0A8A9F]" />
            اعلان‌ها
          </h1>
          <p className="opacity-70 mt-1 text-sm">
            فیلتر، جستجو، علامت‌خوانده/نخوانده، حذف، تازه‌سازی + گروه‌بندی روزانه & Undo
          </p>
        </motion.header>

        {/* Filters + Actions */}
        <motion.section
          initial={rise.hidden}
          animate={rise.show}
          transition={{ duration: 0.35, delay: 0.05 }}
          className={`${glass} p-5`}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0A8A9F]" />
              <Input
                placeholder="جستجو در عنوان/متن/دسته…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Status chips */}
            <div className="flex items-center gap-2">
              <Chip active={status === "all"} onClick={() => setStatus("all")}>
                همه
              </Chip>
              <Chip active={status === "unread"} onClick={() => setStatus("unread")}>
                خوانده‌نشده
              </Chip>
              <Chip active={status === "read"} onClick={() => setStatus("read")}>
                خوانده‌شده
              </Chip>
            </div>
            {/* Category chips */}
            <div className="flex items-center gap-2">
              <Chip active={cat === "all"} onClick={() => setCat("all")}>
                همه دسته‌ها
              </Chip>
              <Chip active={cat === "hr"} onClick={() => setCat("hr")}>
                منابع انسانی
              </Chip>
              <Chip active={cat === "system"} onClick={() => setCat("system")}>
                سیستمی
              </Chip>
              <Chip active={cat === "alert"} onClick={() => setCat("alert")}>
                هشدار
              </Chip>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span>انتخاب همه</span>
              {selected.length > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-black/10">
                  {selected.length} مورد
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => bulkPatch(false)}
                className="border-[#0A8A9F] text-[#0A8A9F]"
              >
                <CheckCircleIcon className="h-4 w-4 ml-1" />
                علامت «خوانده شد»
              </Button>
              <Button
                variant="outline"
                onClick={() => bulkPatch(true)}
                className="border-[#0A8A9F] text-[#0A8A9F]"
              >
                <ExclamationTriangleIcon className="h-4 w-4 ml-1" />
                علامت «نخوانده»
              </Button>
              <Button
                variant="outline"
                onClick={bulkDelete}
                className="border-rose-500 text-rose-600"
              >
                <TrashIcon className="h-4 w-4 ml-1" />
                حذف
              </Button>
              <Button
                onClick={async () => {
                  await load();
                  notifyUpdate();
                }}
                className="bg-[#0A8A9F] text-white"
              >
                تازه‌سازی
              </Button>
            </div>
          </div>
        </motion.section>

        {/* List (گروه‌بندی روزانه) */}
        <motion.section
          initial={rise.hidden}
          animate={rise.show}
          transition={{ duration: 0.35, delay: 0.1 }}
          className={`${glass} p-6`}
        >
          {err && <div className="text-rose-600 mb-3">{err}</div>}

          {loading ? (
            <div className="grid gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white/60 animate-pulse" />
              ))}
            </div>
          ) : grouped.ordered.length === 0 ? (
            <div className="opacity-60">اعلانی یافت نشد.</div>
          ) : (
            <div className="space-y-6">
              {grouped.ordered.map((key) => (
                <div key={key} className="space-y-3">
                  <div className="text-sm font-semibold text-[#0A8A9F]">{key}</div>
                  <ul className="grid gap-3">
                    {grouped.map.get(key)!.map((n) => (
                      <li
                        key={n.id}
                        className={`p-4 rounded-xl border flex items-start justify-between ${
                          n.unread !== false
                            ? "bg-white/90 border-[#0A8A9F]/30"
                            : "bg-white/80 border-white/70"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(n.id)}
                            onChange={() => toggleOne(n.id)}
                            className="mt-1"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-800">{n.title}</h3>
                              <Badge cat={n.category} />
                              {n.unread !== false && (
                                <span className="px-2 py-0.5 text-[11px] rounded-full bg-amber-400/80 text-white">
                                  خوانده‌نشده
                                </span>
                              )}
                            </div>
                            {n.body && <p className="text-sm opacity-80 mt-1">{n.body}</p>}
                            {n.created_at && (
                              <div className="text-xs opacity-60 mt-1">
                                {new Date(n.created_at).toLocaleString("fa-IR")}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {n.unread !== false ? (
                            <Button
                              variant="outline"
                              onClick={() => markOne(n.id, false)}
                              className="border-[#0A8A9F] text-[#0A8A9F]"
                            >
                              خواندم
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => markOne(n.id, true)}
                              className="border-[#0A8A9F] text-[#0A8A9F]"
                            >
                              علامت نخوانده
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => deleteOne(n.id)}
                            className="border-rose-500 text-rose-600"
                          >
                            حذف
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </main>

      {/* Toast/Undo */}
      {toast}
    </div>
  );
}



