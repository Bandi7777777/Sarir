"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion"; // انیمیشن‌های پیشرفته
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
  PencilIcon, // new icon for edit
  TrashIcon, // new icon for delete
  XMarkIcon, // icon for closing modal
  ChartBarIcon, // new icon for stats
  CalendarIcon, // new icon for meetings
  DocumentTextIcon // new icon for reports
} from "@heroicons/react/24/solid";
import { Tooltip as ReactTooltip } from "react-tooltip"; // tooltip for details
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

/* ─────────────── Theme helpers ─────────────── */
const GLASS = "backdrop-blur-xl border border-gray-400 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,.25)] glow-border"; // کمی تیره‌تر
const GLASS2 = "backdrop-blur-xl border border-gray-400 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,.2)] glow-border-soft";
const PANELBG = "bg-white/40 dark:bg-gray-900/60"; // کمی تیره‌تر و جذاب‌تر
const PANELBG2 = "bg-white/30 dark:bg-gray-900/50";

/* ─────────────── Animations ─────────────── */
const rise = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 140, damping: 18, ease: "easeOut" } },
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
const modalVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};
const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } },
};

/* ─────────────── Types ─────────────── */
type BoardRow = { id: number; name: string; role: string; phone?: string };

/* ─────────────── Modal Components ─────────────── */
function EditModal({ isOpen, onClose, member }: { isOpen: boolean; onClose: () => void; member: BoardRow | null }) {
  if (!isOpen || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("ویرایش ذخیره شد! (placeholder)");
    onClose();
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={modalVariants}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white/90 p-6 rounded-xl shadow-2xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-turquoise-900">ویرایش عضو: {member.name}</h2>
          <Button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <Input defaultValue={member.name} placeholder="نام" className="mb-4" />
          <Input defaultValue={member.role} placeholder="نقش" className="mb-4" />
          <Input defaultValue={member.phone} placeholder="شماره تماس" className="mb-4" />
          <Button type="submit" className="w-full bg-gradient-to-r from-turquoise-400 to-orange-500 text-white">
            ذخیره تغییرات
          </Button>
        </form>
      </div>
    </motion.div>
  );
}

function DeleteModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={modalVariants}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white/90 p-6 rounded-xl shadow-2xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-turquoise-900">تایید حذف</h2>
          <Button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <p className="mb-4 text-turquoise-800">آیا مطمئن هستید که می‌خواهید این عضو را حذف کنید؟</p>
        <div className="flex gap-4">
          <Button onClick={onClose} className="flex-1 bg-gray-300 text-gray-900 hover:bg-gray-400">
            لغو
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-500 text-white hover:bg-red-600">
            حذف
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

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
      whileHover={{ scale: 1.05, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-turquoise-400 to-orange-500 text-white shadow-md"
          : "bg-gray-300 text-turquoise-900 hover:bg-gray-400 hover:shadow-md"
      }`}
      aria-label={children.toString()}
    >
      {children}
    </motion.button>
  );
}

function BoardCard({ member, onEdit, onDelete }: { member: BoardRow; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.li
      whileHover={{ scale: 1.03, y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }} // shadow قوی‌تر برای جذابیت
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 12, ease: "easeInOut" }}
      className="p-6 rounded-2xl border border-gray-400 bg-white/40 flex items-center justify-between group hover:bg-white/50 transition-all duration-300 glow-border-soft"
      data-tooltip-id={`tooltip-${member.id}`}
      aria-label={`کارت عضو: ${member.name}`}
    >
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="size-12 rounded-xl grid place-items-center bg-gradient-to-br from-turquoise-400 to-orange-500 text-white shadow-lg"
        >
          <BuildingOffice2Icon className="h-6 w-6" />
        </motion.div>
        <div>
          <div className="font-bold text-turquoise-900 text-lg">{member.name}</div>
          <div className="text-sm opacity-70 text-turquoise-800">{member.role}</div>
          <div className="text-xs opacity-60 text-turquoise-700">{member.phone || "—"}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="p-2 rounded-full bg-transparent text-turquoise-600 hover:text-turquoise-900 hover:bg-turquoise-200/80 transition-all duration-300"
          onClick={onEdit}
          aria-label={`ویرایش عضو: ${member.name}`}
        >
          <PencilIcon className="h-5 w-5" />
        </Button>
        <Button
          className="p-2 rounded-full bg-transparent text-red-600 hover:text-red-900 hover:bg-red-200/80 transition-all duration-300"
          onClick={onDelete}
          aria-label={`حذف عضو: ${member.name}`}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
        <Link
          href={`/board/view/${member.id}`}
          className="text-turquoise-600 hover:text-orange-500 font-semibold transition-colors"
          aria-label={`جزئیات عضو: ${member.name}`}
        >
          جزئیات →
        </Link>
      </div>
      <ReactTooltip
        id={`tooltip-${member.id}`}
        place="top"
        content={`تماس: ${member.phone || "موجود نیست"}`}
        className="bg-gray-800 text-white p-2 rounded-md"
      />
    </motion.li>
  );
}

/* ─────────────── Stats Card ─────────────── */
function StatsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`${GLASS2} ${PANELBG2} p-6 flex flex-col md:flex-row gap-4 justify-around`}
    >
      <div className="flex items-center gap-3">
        <ChartBarIcon className="h-8 w-8 text-turquoise-600" />
        <div>
          <div className="text-2xl font-bold text-turquoise-900">3</div>
          <div className="text-sm text-turquoise-700">تعداد اعضا</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <UsersIcon className="h-8 w-8 text-orange-500" />
        <div>
          <div className="text-2xl font-bold text-turquoise-900">1</div>
          <div className="text-sm text-turquoise-700">رئیس هیئت</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <BuildingOffice2Icon className="h-8 w-8 text-turquoise-600" />
        <div>
          <div className="text-2xl font-bold text-turquoise-900">2</div>
          <div className="text-sm text-turquoise-700">اعضای عادی</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <CalendarIcon className="h-8 w-8 text-green-500" />
        <div>
          <div className="text-2xl font-bold text-turquoise-900">5</div>
          <div className="text-sm text-turquoise-700">جلسات برگزار شده</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <DocumentTextIcon className="h-8 w-8 text-blue-500" />
        <div>
          <div className="text-2xl font-bold text-turquoise-900">12</div>
          <div className="text-sm text-turquoise-700">گزارش‌های تصمیم‌گیری</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────── Page ─────────────── */
export default function BoardMembersList() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "chair" | "member">("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BoardRow | null>(null);

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

  /* CSV export با استفاده از modern Blob API */
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

  /* توابع برای modal */
  function openEditModal(member: BoardRow) {
    setSelectedMember(member);
    setEditModalOpen(true);
  }

  function openDeleteModal(member: BoardRow) {
    setSelectedMember(member);
    setDeleteModalOpen(true);
  }

  function handleDeleteConfirm() {
    toast.error("عضو حذف شد! (placeholder)");
    setDeleteModalOpen(false);
  }

  // Define barChartData and pieChartData based on data (similar to personnel file)
  const stats = useMemo(() => {
    const total = data.length;
    const chairs = data.filter((x) => x.role.includes("رئیس")).length;
    const members = data.filter((x) => x.role.includes("عضو")).length;
    return { total, chairs, members };
  }, [data]);

  const barChartData = [
    { name: "کل", value: stats.total, fill: "#07657E" },
    { name: "رئیس", value: stats.chairs, fill: "#F2991F" },
    { name: "عضو", value: stats.members, fill: "#1FB4C8" },
  ];

  const pieChartData = [
    { name: "رئیس", value: stats.chairs, fill: "#07657E" },
    { name: "عضو", value: stats.members, fill: "#F2991F" },
  ];

  return (
    <div
      dir="rtl"
      className="flex min-h-screen text-turquoise-900 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(120rem 70rem at 120% -10%, rgba(7,101,126,.18), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(242,153,31,.18), transparent), #a0aec0",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[.08] [background:repeating-linear-gradient(90deg,rgba(0,0,0,.25)_0_1px,transparent_1px_28px),repeating-linear-gradient(0deg,rgba(0,0,0,.2)_0_1px,transparent_1px_28px)]" />

      <div className="flex-1 p-6 md:p-8 gap-6 overflow-hidden flex flex-col">
        <motion.header
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="backdrop-blur-sm border border-gray-200/30 rounded-xl shadow-sm bg-white/80 p-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-turquoise-900">
              اعضای هیئت‌مدیره ({filtered.length})
            </h1>
            <p className="text-sm text-turquoise-600 mt-1">مدیریت و نظارت</p>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-600 text-white rounded-lg px-4 py-2 text-sm shadow-sm transition-all duration-300 btn-add"
              onClick={() => toast("در حال توسعه!")}
            >
              <UserPlusIcon className="h-4 w-4 mr-2" /> افزودن
            </Button>
          </div>
        </motion.header>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="backdrop-blur-sm border border-gray-200/30 rounded-xl shadow-sm bg-white/80 p-4 grid md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <motion.div variants={rise} className="p-3 rounded-lg bg-turquoise-50/50 border border-turquoise-100 shadow-inner">
                <h3 className="text-xs font-medium text-turquoise-700">تعداد اعضا</h3>
                <p className="text-xl font-bold text-turquoise-900">3</p>
              </motion.div>
              <motion.div variants={rise} className="p-3 rounded-lg bg-orange-50/50 border border-orange-100 shadow-inner">
                <h3 className="text-xs font-medium text-orange-700">رئیس هیئت</h3>
                <p className="text-xl font-bold text-orange-900">1</p>
              </motion.div>
              <motion.div variants={rise} className="p-3 rounded-lg bg-turquoise-50/50 border border-turquoise-100 shadow-inner">
                <h3 className="text-xs font-medium text-turquoise-700">اعضای عادی</h3>
                <p className="text-xl font-bold text-turquoise-900">2</p>
              </motion.div>
              <motion.div variants={rise} className="p-3 rounded-lg bg-green-50/50 border border-green-100 shadow-inner">
                <h3 className="text-xs font-medium text-green-700">جلسات</h3>
                <p className="text-xl font-bold text-green-900">5</p>
              </motion.div>
              <motion.div variants={rise} className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 shadow-inner">
                <h3 className="text-xs font-medium text-blue-700">گزارش‌ها</h3>
                <p className="text-xl font-bold text-blue-900">12</p>
              </motion.div>
            </div>
            <Button
              onClick={exportCSV}
              className="w-full bg-gradient-to-r from-turquoise-500 to-turquoise-600 text-white rounded-lg py-2 text-sm shadow-sm transition-all duration-300 btn-export"
            >
              خروجی CSV
            </Button>
          </div>
          <motion.div variants={rise} className="space-y-4">
            <div className="h-32">
              <ResponsiveContainer>
                <BarChart data={barChartData}>
                  <XAxis dataKey="name" stroke="#07657E" fontSize={12} />
                  <YAxis stroke="#07657E" fontSize={12} />
                  <Tooltip wrapperStyle={{ fontSize: "12px", background: "white", border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="value" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-32">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieChartData} dataKey="value" outerRadius={60} label={false}>
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ fontSize: "12px", background: "white", border: "1px solid #e5e7eb" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="backdrop-blur-sm border border-gray-200/30 rounded-xl shadow-sm bg-white/80 p-3 flex items-center gap-3"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-turquoise-600" />
          <Input
            placeholder="جستجو نام یا نقش..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none text-turquoise-900 placeholder:text-turquoise-500 focus:outline-none text-sm"
          />
          <div className="flex gap-2">
            <Chip active={filterRole === "all"} onClick={() => setFilterRole("all")}>همه</Chip>
            <Chip active={filterRole === "chair"} onClick={() => setFilterRole("chair")}>رئیس</Chip>
            <Chip active={filterRole === "member"} onClick={() => setFilterRole("member")}>عضو</Chip>
          </div>
          <Button
            className="text-turquoise-600 hover:text-turquoise-800 p-1 btn-refresh"
            onClick={() => toast("رفرش شد!")}
          >
            <ArrowPathIcon className="h-5 w-5" />
          </Button>
        </motion.div>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="flex-1 overflow-y-auto space-y-6"
        >
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-turquoise-600">
              موردی یافت نشد.
            </div>
          ) : (
            <motion.ul variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filtered.map((e) => (
                  <BoardCard
                    key={e.id}
                    member={e}
                    onEdit={() => openEditModal(e)}
                    onDelete={() => openDeleteModal(e)}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </motion.section>
      </div>

      <EditModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} member={selectedMember} />
      <DeleteModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} />
    </div>
  );
}