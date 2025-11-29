"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, type Variants } from "framer-motion";
import {
  AlertOctagon,
  Calendar,
  Mail,
  Phone,
  RotateCcw,
  Search,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { ListPageLayout } from "@/components/layouts/ListPageLayout";
import { FilterBar } from "@/components/list/FilterBar";
import { ListActionBar } from "@/components/list/ListActionBar";
import { ListHeader } from "@/components/list/ListHeader";
import { TableShell } from "@/components/list/TableShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type BoardMember = {
  id: number;
  name: string;
  role: string;
  photoUrl: string;
  bio: string;
  startDate: string;
  email: string;
  phone: string;
  isActive: boolean;
};

const mockMembers: BoardMember[] = [
  {
    id: 1,
    name: "احمد رضایی نیا",
    role: "رییس هیئت مدیره",
    photoUrl: "/images/member1.jpg",
    bio: "متخصص در مدیریت زنجیره تامین با سابقه ۱۵ سال فعالیت در صنعت حمل‌ونقل.",
    startDate: "1400/01/01",
    email: "a.rezaee@sarir.com",
    phone: "09121111111",
    isActive: true,
  },
  {
    id: 2,
    name: "سعید محمدی پور",
    role: "نایب رییس و عضو غیر موظف",
    photoUrl: "/images/member2.jpg",
    bio: "پژوهشگر حوزه لجستیک و بهبود فرآیندها با تمرکز بر تحول دیجیتال.",
    startDate: "1401/05/15",
    email: "s.mohammadi@sarir.com",
    phone: "09122222222",
    isActive: true,
  },
  {
    id: 3,
    name: "الهه کریمی راد",
    role: "عضو موظف (اجرایی)",
    photoUrl: "/images/member3.jpg",
    bio: "راهبر تیم‌های عملیاتی و مسئول پیاده‌سازی پروژه‌های زیرساختی.",
    startDate: "1398/11/20",
    email: "a.karimi@sarir.com",
    phone: "09123333333",
    isActive: true,
  },
  {
    id: 4,
    name: "نگار حسینی مهر",
    role: "عضو غیر موظف (مالی)",
    photoUrl: "/images/member4.jpg",
    bio: "مشاور مالی و سرمایه‌گذاری با تجربه در شرکت‌های لجستیک و حمل‌ونقل.",
    startDate: "1402/03/10",
    email: "n.hosseini@sarir.com",
    phone: "09124444444",
    isActive: true,
  },
  {
    id: 5,
    name: "مصطفی یوسفی فر",
    role: "عضو مستقل",
    photoUrl: "/images/member5.jpg",
    bio: "کارشناس راهبردی با تمرکز بر توسعه بازار و نوآوری در حمل‌ونقل.",
    startDate: "1403/02/05",
    email: "m.yousefi@sarir.com",
    phone: "09125555555",
    isActive: true,
  },
];

async function getBoardMembers(): Promise<BoardMember[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockMembers), 800));
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

export default function BoardMembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);

  const {
    data: membersData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["boardMembers"],
    queryFn: getBoardMembers,
  });

  const data = useMemo(() => membersData ?? [], [membersData]);

  const filteredMembers = useMemo(() => {
    let temp = data;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      temp = temp.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.bio.toLowerCase().includes(q)
      );
    }
    if (filterRole !== "all") {
      temp = temp.filter((m) => m.role === filterRole);
    }
    return temp;
  }, [data, searchTerm, filterRole]);

  const uniqueRoles = useMemo(() => [...new Set(data.map((m) => m.role))], [data]);

  const totalActive = filteredMembers.filter((m) => m.isActive).length;

  const exportCSV = () => {
    const rows = [
      ["نام", "نقش", "ایمیل", "تلفن", "وضعیت"],
      ...filteredMembers.map((m) => [
        m.name,
        m.role,
        m.email,
        m.phone,
        m.isActive ? "فعال" : "غیرفعال",
      ]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "board.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("خروجی CSV آماده شد");
  };

  const toolbar = (
    <FilterBar>
      <div className="flex flex-1 items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="جستجو در نام، نقش یا توضیحات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          dir="rtl"
        />
      </div>
      <ListActionBar>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="نقش" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">همه نقش‌ها</SelectItem>
            {uniqueRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">به‌روزرسانی</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={exportCSV}>
          خروجی CSV
        </Button>
        <Button asChild size="sm">
          <Link href="/board/register">ثبت عضو جدید</Link>
        </Button>
      </ListActionBar>
    </FilterBar>
  );

  return (
    <div dir="rtl">
      <ListPageLayout
        title="اعضای هیئت مدیره"
        description="لیست و جزئیات اعضای هیئت مدیره با فیلتر و کارت‌های خلاصه"
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link href="/board/register">ثبت عضو جدید</Link>
          </Button>
        }
        toolbar={toolbar}
      >
        <ListHeader
          title="اعضا"
          description="کارت‌های اعضا به همراه فیلتر نقش و جزئیات"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {filteredMembers.length} عضو
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                {totalActive} فعال
              </span>
            </div>
          }
        />

        <KPISection data={data} />

        <TableShell>
          <div className="p-4">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[260px] rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="report-panel flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/10 p-10 text-destructive">
                <AlertOctagon size={48} />
                <p className="text-lg">خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.</p>
                <Button onClick={() => refetch()} variant="destructive">
                  تلاش مجدد
                </Button>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="report-panel flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-muted-foreground">
                <Search size={32} />
                <p>عضوی مطابق فیلترها پیدا نشد.</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={{ hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                initial="hidden"
                animate="visible"
              >
                {filteredMembers.map((member) => (
                  <MemberCard key={member.id} member={member} onClick={setSelectedMember} />
                ))}
              </motion.div>
            )}
          </div>
        </TableShell>

        <MemberDetailsDialog member={selectedMember} setMember={setSelectedMember} />
      </ListPageLayout>
    </div>
  );
}

function KPISection({ data }: { data: BoardMember[] }) {
  const totalMembers = data.length;
  const activeMembers = data.filter((m) => m.isActive).length;
  const avgTenure =
    data.length > 0
      ? data.reduce((acc, member) => {
          const startYear = parseInt(member.startDate.substring(0, 4));
          return acc + (1404 - startYear);
        }, 0) / data.length
      : 0;

  const Card = ({
    icon,
    title,
    value,
    color,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    color: string;
  }) => (
    <motion.div
      className={`report-panel rounded-xl border-t-4 border-b-4 ${color}/50 p-6 transition-all duration-300`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, delay: 0.05 }}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${color}`}>{title}</span>
        <div className={`rounded-full p-2 ${color}/20`}>{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-extrabold text-foreground">{value}</p>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card icon={<Users size={20} className="text-[#0097B2]" />} title="تعداد کل" value={totalMembers.toLocaleString("fa-IR")} color="text-[#0097B2]" />
      <Card
        icon={<UserCheck size={20} className="text-[#FFC46A]" />}
        title="اعضای فعال"
        value={activeMembers.toLocaleString("fa-IR")}
        color="text-[#FFC46A]"
      />
      <Card
        icon={<Calendar size={20} className="text-[#4DA8FF]" />}
        title="میانگین سابقه"
        value={`${Number(avgTenure.toFixed(1)).toLocaleString("fa-IR", { minimumFractionDigits: 1 })} سال`}
        color="text-[#4DA8FF]"
      />
    </div>
  );
}

function MemberCard({ member, onClick }: { member: BoardMember; onClick: (m: BoardMember) => void }) {
  return (
    <motion.div
      className="report-panel group flex cursor-pointer flex-col items-center space-y-4 rounded-xl p-6 text-center shadow-sm transition-all duration-300"
      variants={cardVariants}
      whileHover={{ translateY: -4, boxShadow: "0 10px 30px rgba(0, 151, 178, 0.12)", filter: "brightness(1.02)" }}
      onClick={() => onClick(member)}
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-primary/20 bg-primary/10 text-primary">
        <div className="flex h-full w-full items-center justify-center">
          <User size={48} />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
      <p className="rounded-full border border-[#FFC46A]/30 bg-[#FFC46A]/10 px-3 py-1 text-sm font-semibold text-[#FFC46A]">
        {member.role}
      </p>

      <p className="line-clamp-2 h-10 text-sm text-muted-foreground">{member.bio}</p>

      <div className="w-full space-y-2 border-t border-border/60 pt-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail size={14} className="text-primary" />
          <span>{member.email}</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Phone size={14} className="text-primary" />
          <span>{member.phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3")}</span>
        </div>
      </div>

      <Button size="sm" variant="ghost" className="text-primary hover:text-primary">
        مشاهده
      </Button>
    </motion.div>
  );
}

function MemberDetailsDialog({
  member,
  setMember,
}: {
  member: BoardMember | null;
  setMember: (m: BoardMember | null) => void;
}) {
  if (!member) return null;
  return (
    <Dialog open={!!member} onOpenChange={() => setMember(null)}>
      <DialogContent className="report-panel border-border bg-background text-foreground sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center gap-4">
          <div className="flex size-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary/40 text-primary">
            <User size={32} />
          </div>
          <div>
            <DialogTitle className="text-2xl font-extrabold text-primary">{member.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4 text-muted-foreground">
          <p className="border-b border-border pb-3 text-base leading-relaxed italic">&ldquo;{member.bio}&rdquo;</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <span className="font-semibold">تاریخ شروع:</span>
              <span>{member.startDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-emerald-500" />
              <span className="font-semibold">وضعیت:</span>
              <span>{member.isActive ? "فعال" : "غیرفعال"}</span>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              <span className="font-semibold">ایمیل:</span>
              <span>{member.email}</span>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Phone size={16} className="text-primary" />
              <span className="font-semibold">تلفن:</span>
              <span>{member.phone}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
