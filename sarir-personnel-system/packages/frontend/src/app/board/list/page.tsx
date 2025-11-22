"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  User, BriefcaseBusiness, Calendar, Search, Mail, Phone, RotateCcw,
  Users, CheckCircle, AlertOctagon, UserCheck, Settings2
} from "lucide-react";
import { toast } from "react-hot-toast";

/* فرض بر وجود کامپوننت‌های UI در مسیرهای زیر */
import Input from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { cn } from "@/lib/utils"; // در صورت نیاز برای ترکیب کلاس‌ها

// اگر از Next.js Image استفاده می‌کنید، آن را فعال کنید.
// const Image = dynamic(() => import("next/image"), { ssr: false });

// --- Type Definitions ---
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

// --- Mock Data and API Function ---
const mockMembers: BoardMember[] = [
    { id: 1, name: "دکتر امیرحسین رضایی", role: "رئیس هیئت مدیره", photoUrl: "/images/member1.jpg", bio: "متخصص در مدیریت استراتژیک، توسعه کسب و کار و رهبری تحول آفرین.", startDate: "1400/01/01", email: "a.rezaee@sarir.com", phone: "09121111111", isActive: true },
    { id: 2, name: "مهندس سارا محمدی", role: "مدیر عامل و عضو هیئت مدیره", photoUrl: "/images/member2.jpg", bio: "سابقه درخشان در تحول دیجیتال، بهینه‌سازی فرآیندها و افزایش بهره‌وری عملیاتی.", startDate: "1401/05/15", email: "s.mohammadi@sarir.com", phone: "09122222222", isActive: true },
    { id: 3, name: "آقای علیرضا کریمی", role: "عضو هیئت مدیره (مالی)", photoUrl: "/images/member3.jpg", bio: "کارشناس ارشد مالی و سرمایه‌گذاری، متمرکز بر شفافیت مالی و کاهش ریسک.", startDate: "1398/11/20", email: "a.karimi@sarir.com", phone: "09123333333", isActive: true },
    { id: 4, name: "خانم نسرین حسینی", role: "عضو هیئت مدیره (حقوقی)", photoUrl: "/images/member4.jpg", bio: "وکیل و مشاور حقوقی شرکت با تخصص در امور قراردادها و سازگاری قانونی.", startDate: "1402/03/10", email: "n.hosseini@sarir.com", phone: "09124444444", isActive: true },
    { id: 5, name: "مهندس مهران یوسفی", role: "عضو ناظر", photoUrl: "/images/member5.jpg", bio: "متخصص معماری سازمانی و نظارت بر پروژه‌های زیرساختی شرکت.", startDate: "1403/02/05", email: "m.yousefi@sarir.com", phone: "09125555555", isActive: true },
];

async function getBoardMembers(): Promise<BoardMember[]> { 
    return new Promise(resolve => setTimeout(() => resolve(mockMembers), 800)); 
}

// --- Component: Header ---
const BoardHeader = ({ totalCount }: { totalCount: number }) => (
    <div className="flex justify-between items-center mb-6 pt-4 px-4">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users size={28} className="text-[#FFC46A]"/>
            اعضای هیئت مدیره و مدیریت ارشد
        </h1>
        <div className="flex items-center gap-4 text-white/80">
            <div className="text-lg font-semibold flex items-center gap-2 px-3 py-1 bg-[#FFC46A]/10 rounded-full border border-[#FFC46A]/30">
                <UserCheck size={18} className="text-[#FFC46A]"/>
                <span>{totalCount.toLocaleString('fa-IR')}</span>
                <span className="text-sm text-white/60">نفر</span>
            </div>
            <Button variant="ghost" className="text-white/80 hover:text-[#0097B2]">
                 <Settings2 size={20} />
            </Button>
        </div>
    </div>
);

// --- Component: KPI Cards ---
const KPISection = ({ data }: { data: BoardMember[] }) => {
    const totalMembers = data.length;
    const activeMembers = data.filter(m => m.isActive).length;
    const avgTenure = data.length > 0
        ? data.reduce((acc, member) => {
            // محاسبه ساده سابقه بر اساس سال (فرض بر سال 1404)
            const startYear = parseInt(member.startDate.substring(0, 4));
            return acc + (1404 - startYear);
        }, 0) / data.length
        : 0;
        
    const Card = ({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string, color: string }) => (
        <motion.div 
            className={`report-panel p-6 rounded-xl border-t-4 border-b-4 ${color}/50 hover:shadow-lg transition-all duration-300`}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
        >
            <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${color}`}>{title}</span>
                <div className={`p-2 rounded-full ${color}/20`}>
                    {icon}
                </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-white tracking-tight">{value}</p>
        </motion.div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mb-8">
            <Card 
                icon={<Users size={20} className="text-[#0097B2]"/>} 
                title="مجموع اعضا" 
                value={totalMembers.toLocaleString('fa-IR')} 
                color="text-[#0097B2]"
            />
            <Card 
                icon={<BriefcaseBusiness size={20} className="text-[#FFC46A]"/>} 
                title="اعضای فعال" 
                value={activeMembers.toLocaleString('fa-IR')} 
                color="text-[#FFC46A]"
            />
            <Card 
                icon={<Calendar size={20} className="text-[#4DA8FF]"/>} 
                title="متوسط سابقه" 
                value={`${avgTenure.toFixed(1).toLocaleString('fa-IR')} سال`} 
                color="text-[#4DA8FF]"
            />
        </div>
    );
};

// --- Component: Member Card ---
const MemberCard = ({ member, onClick }: { member: BoardMember, onClick: (m: BoardMember) => void }) => (
    <motion.div 
        className="report-panel p-6 rounded-xl shadow-lg hover:shadow-neon-soft transition-all duration-300 flex flex-col items-center text-center space-y-4 cursor-pointer"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ translateY: -5, boxShadow: "0 10px 30px rgba(0, 151, 178, 0.2)", filter: "brightness(1.1)" }}
        onClick={() => onClick(member)}
    >
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#FFC46A]/50 shadow-lg p-1 bg-white/5">
             <div className="w-full h-full bg-[#0097B2]/30 flex items-center justify-center text-[#0097B2] rounded-full">
                 <User size={48} />
                 {/* در صورت وجود عکس واقعی، بجای User از Image استفاده شود */}
             </div>
        </div>

        <h3 className="text-xl font-extrabold text-white">{member.name}</h3>
        <p className="text-sm font-semibold text-[#FFC46A] px-3 py-1 rounded-full bg-[#FFC46A]/10 border border-[#FFC46A]/30">{member.role}</p>

        <p className="text-sm text-white/70 h-10 overflow-hidden line-clamp-2">{member.bio}</p>
        
        <div className="w-full pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                <Mail size={14} className="text-[#0097B2]"/>
                <span>{member.email}</span>
            </div>
        </div>
        
        <Button size="sm" variant="ghost" className="text-white/80 hover:text-[#0097B2]">
            جزئیات
        </Button>
    </motion.div>
);

// --- Component: Member Details Dialog (Placeholder) ---
const MemberDetailsDialog = ({ member, setMember }: { member: BoardMember | null, setMember: (m: BoardMember | null) => void }) => {
    if (!member) return null;
    return (
        <Dialog open={!!member} onOpenChange={() => setMember(null)}>
            <DialogContent className="bg-[#1d252e] text-white border-[#0097B2]/50 report-panel max-w-lg">
                <DialogHeader className="flex flex-row items-center gap-4">
                    <div className="relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-[#FFC46A]/50 flex items-center justify-center text-[#FFC46A]">
                         <User size={32} />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-extrabold text-[#FFC46A]">{member.name}</DialogTitle>
                        <p className="text-sm text-[#0097B2] font-medium">{member.role}</p>
                    </div>
                </DialogHeader>

                <div className="mt-4 space-y-4 text-white/90">
                    <p className="text-base leading-relaxed border-b border-white/10 pb-3 italic">"بیوگرافی: {member.bio}"</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-[#0097B2]"/>
                            <span className="font-semibold">تاریخ شروع:</span>
                            <span>{member.startDate.toLocaleString('fa-IR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-400"/>
                            <span className="font-semibold">وضعیت:</span>
                            <span>{member.isActive ? "فعال" : "غیرفعال"}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <Mail size={16} className="text-[#FFC46A]"/>
                            <span className="font-semibold">ایمیل:</span>
                            <span>{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <Phone size={16} className="text-[#FFC46A]"/>
                            <span className="font-semibold">تماس:</span>
                            <span>{member.phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3')}</span>
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};


// --- Main Page Component ---
export default function BoardMembersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);

    const { data: membersData, isLoading, isError, refetch } = useQuery({
        queryKey: ['boardMembers'],
        queryFn: getBoardMembers,
    });
    
    const data = membersData ?? [];

    const filteredMembers = useMemo(() => {
        let temp = data;
        if (searchTerm) {
            temp = temp.filter(m => m.name.includes(searchTerm) || m.role.includes(searchTerm) || m.bio.includes(searchTerm));
        }
        if (filterRole !== "all") {
            temp = temp.filter(m => m.role === filterRole);
        }
        return temp;
    }, [data, searchTerm, filterRole]);
    
    const uniqueRoles = useMemo(() => [
        ...new Set(data.map(m => m.role))
    ], [data]);

    return (
        <div className="reports-neon min-h-screen pb-10">
            {/* استفاده از کلاس reports-neon برای اعمال استایل‌های نئونی و پس‌زمینه تیره */}
            <div className="orb orb--teal" />
            <div className="orb orb--orange" />

            <BoardHeader totalCount={data.length} />
            
            <KPISection data={data} />
            
            {/* Toolbar: Search, Filter, Refresh */}
            <div className="reports-toolbar-panel flex flex-col md:flex-row justify-between items-stretch md:items-center mt-8 p-4 rounded-xl mx-4 gap-4">
                <Input
                    placeholder="جستجو بر اساس نام، نقش یا بیوگرافی..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 h-10 bg-transparent border-white/20 text-white placeholder-white/50 focus:border-[#0097B2]"
                    icon={<Search size={18} className="text-white/50"/>}
                />
                
                <div className="flex items-center gap-3">
                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-40 bg-transparent border-white/20 text-white h-10 hover:border-[#FFC46A]">
                            <SelectValue placeholder="فیلتر نقش" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1d252e] border-[#0097B2]/50 text-white">
                            <SelectItem value="all">همه نقش‌ها</SelectItem>
                            {uniqueRoles.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <Button 
                        onClick={() => refetch()}
                        variant="ghost" 
                        className="text-white/80 hover:text-[#0097B2] h-10"
                        disabled={isLoading}
                    >
                        {isLoading ? <RotateCcw size={20} className="animate-spin" /> : <RotateCcw size={20} />}
                    </Button>
                </div>
            </div>

            <div className="mt-8 px-4">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-[280px] rounded-xl bg-white/5"/>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center p-20 report-panel text-red-400">
                        <AlertOctagon size={48} />
                        <p className="mt-4 text-xl">خطا در بارگذاری اطلاعات اعضا. لطفا دوباره تلاش کنید.</p>
                        <Button onClick={() => refetch()} className="mt-4 bg-red-600 hover:bg-red-700">تلاش مجدد</Button>
                    </div>
                ) : filteredMembers.length === 0 ? (
                     <div className="flex flex-col items-center justify-center p-20 report-panel text-[#FFC46A]">
                        <Search size={48} />
                        <p className="mt-4 text-xl">هیچ عضوی با معیارهای جستجو پیدا نشد.</p>
                     </div>
                ) : (
                    <motion.div 
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                        variants={{
                            hidden: { opacity: 1 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
                        }}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredMembers.map((member) => (
                            <MemberCard 
                                key={member.id} 
                                member={member} 
                                onClick={setSelectedMember}
                            />
                        ))}
                    </motion.div>
                )}
            </div>
            
            <MemberDetailsDialog member={selectedMember} setMember={setSelectedMember} />
        </div>
    );
}