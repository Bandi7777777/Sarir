"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion"; // اضافه برای انیمیشن‌های پیشرفته
import { toast } from "react-hot-toast"; // feedback بصری
import {
  UsersIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  FunnelIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/solid";
import { Tooltip as ReactTooltip } from "react-tooltip"; // tooltip برای جزئیات

/* ─────────────── Theme helpers ─────────────── */
const GLASS = "backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,.3)] glow-border";
const GLASS2 = "backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,.2)] glow-border-soft";
const PANELBG = "bg-white/10 dark:bg-white/10";
const PANELBG2 = "bg-white/8 dark:bg-white/8";

/* ─────────────── Animations ─────────────── */
const rise = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/* ─────────────── Types ─────────────── */
type BoardRow = { id: number; name: string; role: string; phone?: string };

/* ─────────────── Small pieces ─────────────── */
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
    <motion.button
      whileHover={{ scale: 1.1, rotate: 2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-lg"
          : "bg-white/10 text-turquoise-100 hover:bg-white/20"
      }`}
    >
      {children}
    </motion.button>
  );
}

function BoardCard({ member }: { member: BoardRow }) {
  return (
    <motion.li
      whileHover={{ scale: 1.03, y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 12 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/8 flex items-center justify-between group hover:bg-white/15 transition-all duration-300 glow-border-soft"
      data-tooltip-id={`tooltip-${member.id}`}
    >
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="size-12 rounded-xl grid place-items-center bg-gradient-to-br from-turquoise-400 to-orange-500 text-white shadow-lg"
        >
          <BuildingOffice2Icon className="h-6 w-6" />
        </motion.div>
        <div>
          <div className="font-bold text-turquoise-50 text-lg">{member.name}</div>
          <div className="text-sm opacity-70 text-turquoise-200">{member.role}</div>
          <div className="text-xs opacity-60 text-turquoise-300">{member.phone || "—"}</div>
        </div>
      </div>
      <Link
        href={`/board/view/${member.id}`}
        className="text-turquoise-300 hover:text-orange-400 font-semibold transition-colors"
      >
        جزئیات →
      </Link>
      <ReactTooltip
        id={`tooltip-${member.id}`}
        place="top"
        content={`تماس: ${member.phone || "موجود نیست"}`}
        className="bg-black/80 text-white p-2 rounded-md"
      />
    </motion.li>
  );
}

/* ─────────────── Page ─────────────── */
export default function BoardMembersList() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "chair" | "member">("all");

  const data = useMemo<BoardRow[]>(
    () => [
      { id: 1, name: "علی محمدی", role: "رئیس هیئت‌مدیره", phone: "09123456789" },
      { id: 2, name: "سارا کریمی", role: "عضو هیئت‌مدیره", phone: "09129876543" },
      { id: 3, name: "محمد رضایی", role: "عضو هیئت‌مدیره", phone: "09121234567" },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const k = search.trim().toLowerCase();
    let list = data;
    if (filterRole === "chair") list = list.filter((x) => x.role.includes("رئیس"));
    if (filterRole === "member") list = list.filter((x) => x.role.includes("عضو"));
    if (k) list = list.filter((x) => `${x.name} ${x.role}`.toLowerCase().includes(k));
    return list;
  }, [data, filterRole, search]);

  /* CSV export */
  function exportCSV() {
    const rows = [
      ["نام", "نقش", "شماره تماس"],
      ...filtered.map((m) => [m.name, m.role, m.phone || ""]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "board_members.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("فایل CSV دانلود شد!");
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen text-turquoise-50 relative"
      style={{
        background:
          "radial-gradient(120rem 70rem at 120% -10%, rgba(7,101,126,.18), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(242,153,31,.18), transparent), #0b1220",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[.12] [background:repeating-linear-gradient(90deg,rgba(255,255,255,.15)_0_1px,transparent_1px_28px),repeating-linear-gradient(0deg,rgba(255,255,255,.12)_0_1px,transparent_1px_28px)]" />

      <Sidebar expanded={false} setExpanded={() => {}} /> {/* غیرفعال برای این صفحه */}

      <div className="flex-1 p-4 md:p-8 gap-6">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          className={`${GLASS} ${PANELBG} p-6 flex items-center justify-between`}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-turquoise-100 neon-text">
              اعضای هیئت‌مدیره
            </h1>
            <p className="text-turquoise-200/70 text-sm mt-1">مدیریت و نظارت سازمانی</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-lg hover:shadow-xl"
              onClick={() => toast("در حال توسعه!")}
            >
              <UserPlusIcon className="h-5 w-5 mr-2" /> افزودن عضو
            </Button>
          </div>
        </motion.header>

        {/* Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`${GLASS2} ${PANELBG2} p-4 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-turquoise-300/80" />
            <Input
              placeholder="جستجو نام یا نقش..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-3 bg-white/5 border-white/10 text-turquoise-50 placeholder:text-turquoise-200/50 focus:ring-turquoise-400/50"
            />
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-turquoise-300/80" />
              <Chip active={filterRole === "all"} onClick={() => setFilterRole("all")}>همه</Chip>
              <Chip active={filterRole === "chair"} onClick={() => setFilterRole("chair")}>رئیس</Chip>
              <Chip active={filterRole === "member"} onClick={() => setFilterRole("member")}>عضو</Chip>
            </div>
          </div>
          <Button
            onClick={exportCSV}
            className="bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            خروجی CSV
          </Button>
        </motion.div>

        {/* List */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className={`${GLASS} ${PANELBG} p-6`}
        >
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-turquoise-200/70"
            >
              موردی یافت نشد.
            </motion.div>
          ) : (
            <motion.ul variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m) => (
                <BoardCard key={m.id} member={m} />
              ))}
            </motion.ul>
          )}
          <ReactTooltip />
        </motion.section>
      </div>
    </div>
  );
}