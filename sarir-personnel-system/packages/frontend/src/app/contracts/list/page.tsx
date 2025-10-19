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
const GLASS = "backdrop-blur-2xl border border-turquoise-300/20 rounded-3xl shadow-[0_20px_50px_rgba(7,101,126,0.25)] glow-border"; // تغییر: glow بیشتر، turquoise opacity برای سازمانی
const GLASS2 = "backdrop-blur-xl border border-orange-300/20 rounded-2xl shadow-[0_10px_30px_rgba(242,153,31,0.2)] glow-border-soft"; // تغییر: orange opacity برای تنوع
const PANELBG = "bg-gradient-to-br from-turquoise-900/10 to-orange-900/10 dark:from-turquoise-900/10 to-orange-900/10"; // تغییر: gradient سازمانی
const PANELBG2 = "bg-turquoise-900/5 dark:bg-orange-900/5"; // تغییر: تنوع با رنگ‌های سازمانی

/* ─────────────── Animations ─────────────── */
const rise = {
  hidden: { y: 30, opacity: 0, scale: 0.95 }, // تغییر: scale اضافه برای جذاب‌تر
  show: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 18 } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
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
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 shadow-md ${active ? "bg-orange-500 text-white glow-active" : "text-turquoise-300 hover:text-turquoise-100 bg-turquoise-900/10 hover:bg-turquoise-900/20"}`} // تغییر: rounded-full، glow، رنگ‌های سازمانی
    >
      {children}
    </button>
  );
}

function BoardCard({ member }: { member: BoardRow }) {
  const { id, name, role, phone } = member;
  return (
    <motion.li
      whileHover={{ scale: 1.05, boxShadow: "0 12px 24px rgba(7,101,126,0.3)" }} // تغییر: hover shadow turquoise
      transition={{ duration: 0.2 }}
      className="p-5 rounded-2xl bg-gradient-to-br from-turquoise-50/20 to-orange-50/20 dark:from-turquoise-900/20 to-orange-900/20 border border-turquoise-200/30 shadow-lg hover:border-orange-400/50" // تغییر: gradient سازمانی، border hover
    >
      <div className="flex items-center gap-3">
        <BuildingOffice2Icon className="h-6 w-6 text-turquoise-600" /> // تغییر: icon سازمانی
        <div>
          <p className="font-bold text-turquoise-800">{name}</p>
          <p className="text-sm text-orange-600">{role}</p>
          {phone && <p className="text-xs text-turquoise-500">{phone}</p>}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Link href={`/board/view/${id}`}>
          <Button variant="outline" className="text-turquoise-600 hover:bg-turquoise-100">جزئیات</Button>
        </Link>
        <Link href={`/board/edit/${id}`}>
          <Button variant="primary" className="bg-orange-500 text-white hover:bg-orange-600">ویرایش</Button>
        </Link>
      </div>
    </motion.li>
  );
}

export default function BoardList() {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // داده‌های نمونه – جایگزین با API واقعی
  const boardData: BoardRow[] = [
    { id: 1, name: "علی احمدی", role: "رئیس", phone: "09123456789" },
    { id: 2, name: "فاطمه رضایی", role: "عضو", phone: "09187654321" },
    // ... بقیه
  ];

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return boardData.filter((m) =>
      (filterRole === "all" || m.role === filterRole) &&
      m.name.toLowerCase().includes(q)
    );
  }, [searchTerm, filterRole, boardData]);

  const exportCSV = () => {
    const csv = filtered.map(m => `${m.name},${m.role},${m.phone ?? ''}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "board.csv";
    a.click();
    toast.success("CSV خروجی گرفته شد!", { style: { background: '#07657E', color: '#fff' } }); // تغییر: toast سازمانی
  };

  return (
    <div className="theme-light flex min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-[#0b1220] dark:to-[#1a2b3c] text-[#0b1220] dark:text-white animate-gradient-bg"> {/* تغییر: gradient جذاب‌تر با رنگ‌های سازمانی */}
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <div className="flex-1 p-4 md:p-8 space-y-8 transition-all duration-300" style={{ paddingRight: expanded ? "280px" : "80px" }}>
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur-lg p-6 rounded-b-xl shadow-xl border-b border-turquoise-200/30" // تغییر: border سازمانی
        >
          <h1 className="text-4xl md:text-5xl font-bold text-turquoise-800 dark:text-turquoise-300 animate-neon-text">
            لیست هیئت مدیره
          </h1>
        </motion.header>

        {/* Controls */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-wrap gap-4 items-center justify-between" // تغییر: layout جذاب‌تر
        >
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-turquoise-400/80" />
            <Input
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 bg-white/5 border-turquoise-200/30 text-turquoise-800 placeholder:text-turquoise-400/50 focus:ring-orange-400/50 rounded-full shadow-inner" // تغییر: rounded-full، shadow inner برای جذابیت
            />
            <div className="flex items-center gap-2 mt-3">
              <FunnelIcon className="h-5 w-5 text-turquoise-400/80" />
              <Chip active={filterRole === "all"} onClick={() => setFilterRole("all")}>همه</Chip>
              <Chip active={filterRole === "chair"} onClick={() => setFilterRole("chair")}>رئیس</Chip>
              <Chip active={filterRole === "member"} onClick={() => setFilterRole("member")}>عضو</Chip>
            </div>
          </div>
          <Button
            onClick={exportCSV}
            className="bg-gradient-to-r from-turquoise-500 to-orange-500 text-white shadow-lg hover:shadow-2xl hover:brightness-110 transition-all duration-300 rounded-full px-6" // تغییر: rounded-full، brightness hover
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
          className={`${GLASS} ${PANELBG} p-6 rounded-3xl overflow-hidden`} // تغییر: overflow-hidden برای smooth
        >
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-turquoise-400/70 font-medium"
            >
              موردی یافت نشد.
            </motion.div>
          ) : (
            <motion.ul variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* تغییر: gap بزرگ‌تر برای جذابیت */}
              {filtered.map((m) => (
                <BoardCard key={m.id} member={m} />
              ))}
            </motion.ul>
          )}
          <ReactTooltip className="bg-turquoise-800 text-white rounded-lg shadow-lg" /> {/* تغییر: tooltip سازمانی */}
        </motion.section>
      </div>
    </div>
  );
}