"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon
} from "@heroicons/react/24/solid";

type Contract = {
  id: number;
  title: string;
  party: string;
  date: string;
  amount: string;
};

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

export default function RegisterContract() {
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    party: "",
    date: "",
    amount: "",
  });
  const [contracts, setContracts] = useState<Contract[]>(() => [
    { id: 1, title: "قرارداد حمل و نقل", party: "شرکت X", date: "2025-07-01", amount: "10000000" },
    { id: 2, title: "قرارداد خدمات IT", party: "شرکت Y", date: "2025-06-15", amount: "5000000" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParty, setFilterParty] = useState<string>("all");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Filter contracts based on search and filter inputs
  const filteredContracts = useMemo(() => {
    let data = contracts;
    // Search by title or party
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      data = data.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.party.toLowerCase().includes(q)
      );
    }
    // Filter by party dropdown
    if (filterParty !== "all") {
      data = data.filter(c => c.party === filterParty);
    }
    // Filter by date range
    if (filterFrom) {
      data = data.filter(c => new Date(c.date) >= new Date(filterFrom));
    }
    if (filterTo) {
      data = data.filter(c => new Date(c.date) <= new Date(filterTo));
    }
    return data;
  }, [contracts, searchTerm, filterParty, filterFrom, filterTo]);

  const exportCSV = () => {
    const header = ["عنوان", "طرف قرارداد", "تاریخ", "مبلغ"];
    const rows = filteredContracts.map(c => [c.title, c.party, c.date, c.amount]);
    const csvContent = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contracts.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("فایل CSV با موفقیت دانلود شد!");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add new contract to list
    const newId = Math.max(0, ...contracts.map(c => c.id)) + 1;
    const newContract: Contract = {
      id: newId,
      title: formData.title,
      party: formData.party,
      date: formData.date,
      amount: formData.amount,
    };
    setContracts(prev => [...prev, newContract]);
    toast.success("قرارداد با موفقیت ثبت شد!");
    // Reset form fields
    setFormData({ title: "", party: "", date: "", amount: "" });
  };

  const openEditModal = (contract: Contract) => {
    setSelectedContract(contract);
    setEditModalOpen(true);
  };

  const openDeleteModal = (contract: Contract) => {
    setSelectedContract(contract);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedContract) {
      setContracts(prev => prev.filter(c => c.id !== selectedContract.id));
      toast.success("قرارداد حذف شد");
    }
    setDeleteModalOpen(false);
    setSelectedContract(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    // Simulate saving changes for now
    toast.success("تغییرات قرارداد ذخیره شد!");
    setEditModalOpen(false);
    setSelectedContract(null);
  };

  return (
    <div 
      dir="rtl" 
      className="flex min-h-screen text-turquoise-900 relative overflow-hidden" 
      style={{
        background: "radial-gradient(120rem 70rem at 120% -10%, rgba(7,101,126,0.18), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(242,153,31,0.18), transparent), #a0aec0"
      }}
    >
      {/* Background grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[.08] [background:repeating-linear-gradient(90deg,rgba(0,0,0,.25)_0_1px,transparent_1px_28px),repeating-linear-gradient(0deg,rgba(0,0,0,.2)_0_1px,transparent_1px_28px)]" />
      
      {/* Sidebar */}
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      
      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300" 
        style={{ paddingRight: expanded ? "280px" : "80px" }}
      >
        {/* Header */}
        <motion.header 
          initial={{ y: -15, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="backdrop-blur-sm border-b border-gray-200/30 shadow-sm bg-white/80 p-4 flex items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-turquoise-900">
              قراردادها ({filteredContracts.length})
            </h1>
            <p className="text-sm text-turquoise-600 mt-1">مدیریت و نظارت</p>
          </div>
          {/* (Optional) Add contract button if form is hidden - not used since form is visible */}
        </motion.header>

        {/* Form Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-4 md:p-6"
        >
          <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-6">
            <div>
              <label className="block text-lg text-turquoise-800 dark:text-turquoise-200 mb-2">
                عنوان قرارداد
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-turquoise-500 text-lg"
                placeholder="مثال: قرارداد حمل و نقل"
              />
            </div>
            <div>
              <label className="block text-lg text-turquoise-800 dark:text-turquoise-200 mb-2">
                طرف قرارداد
              </label>
              <Input
                type="text"
                name="party"
                value={formData.party}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-turquoise-500 text-lg"
                placeholder="مثال: شرکت X"
              />
            </div>
            <div>
              <label className="block text-lg text-turquoise-800 dark:text-turquoise-200 mb-2">
                تاریخ قرارداد
              </label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-turquoise-500 text-lg"
              />
            </div>
            <div>
              <label className="block text-lg text-turquoise-800 dark:text-turquoise-200 mb-2">
                مبلغ قرارداد
              </label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-turquoise-500 text-lg"
                placeholder="مثال: 10000000"
              />
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700 text-white text-lg py-3 rounded-lg shadow-md"
              >
                <PlusIcon className="h-6 w-6 mr-2 inline" /> ثبت قرارداد
              </Button>
            </motion.div>
          </form>
        </motion.section>

        {/* Search and Filters Section */}
        <motion.div 
          initial={{ y: 15, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-2 backdrop-blur-sm border border-gray-200/30 rounded-xl shadow-sm bg-white/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:p-6"
        >
          <div className="flex gap-2 items-center order-2 md:order-1">
            <Button 
              className="md:hidden text-turquoise-600 hover:text-turquoise-800 p-2" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-5 w-5" />
            </Button>
            <div className={`${showFilters ? 'flex' : 'hidden'} md:flex gap-2`}>
              <select 
                value={filterParty} 
                onChange={(e) => setFilterParty(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white text-turquoise-900 text-sm shadow"
              >
                <option value="all">همه طرف‌ها</option>
                {[...new Set(contracts.map(c => c.party))].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <span className="text-xs text-turquoise-700">از</span>
                <Input 
                  type="date" 
                  value={filterFrom} 
                  onChange={(e) => setFilterFrom(e.target.value)}
                  className="p-1 text-xs"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-turquoise-700">تا</span>
                <Input 
                  type="date" 
                  value={filterTo} 
                  onChange={(e) => setFilterTo(e.target.value)}
                  className="p-1 text-xs"
                />
              </div>
            </div>
            <Button 
              className="text-turquoise-600 hover:text-turquoise-800 p-2" 
              onClick={() => { /* Optionally reset filters or refresh */ toast("رفرش شد!")}}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </Button>
            <Button 
              onClick={exportCSV} 
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-600 text-white px-3 py-2 text-sm rounded-lg shadow-sm"
            >
              خروجی CSV
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-1 md:flex-none md:w-1/3 order-1 md:order-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-turquoise-600" />
            <Input
              placeholder="جستجوی قرارداد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white border border-turquoise-300 rounded-md p-2 text-turquoise-900 placeholder:text-turquoise-700 focus:outline-none focus:border-turquoise-500 text-sm"
            />
          </div>
        </motion.div>

        {/* Contracts List Section */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
          {filteredContracts.length === 0 ? (
            <div className="text-center py-10 text-turquoise-700 text-sm">
              موردی یافت نشد.
            </div>
          ) : (
            <motion.ul 
              variants={stagger} 
              initial="hidden" 
              animate="show" 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2"
            >
              <AnimatePresence>
                {filteredContracts.map(contract => (
                  <motion.li 
                    key={contract.id} 
                    variants={listItemVariants} 
                    exit="exit" 
                    whileHover={{ scale: 1.03, boxShadow: '0 6px 15px rgba(0,0,0,0.1)' }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/80 shadow-sm border border-gray-200/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      <DocumentIcon className="h-8 w-8 text-turquoise-600" />
                      <div>
                        <p className="text-base font-semibold text-gray-900">{contract.title}</p>
                        <p className="text-sm text-gray-700">
                          طرف: {contract.party} ・ تاریخ: {contract.date} ・ مبلغ: {contract.amount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button 
                        className="p-2 rounded-full bg-transparent text-turquoise-600 hover:text-turquoise-900 hover:bg-turquoise-100 transition" 
                        onClick={() => openEditModal(contract)}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Button>
                      <Button 
                        className="p-2 rounded-full bg-transparent text-red-600 hover:text-red-800 hover:bg-red-100 transition" 
                        onClick={() => openDeleteModal(contract)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                      <Link 
                        href={`/contracts/view/${contract.id}`} 
                        className="p-2 rounded-full bg-transparent text-turquoise-600 hover:text-orange-500 transition" 
                        aria-label="مشاهده قرارداد"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      </div>

      {/* Edit Contract Modal */}
      <AnimatePresence>
        {editModalOpen && selectedContract && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-80 max-w-sm">
              <h2 className="text-xl font-bold text-turquoise-900 mb-4">ویرایش قرارداد</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <Input type="text" defaultValue={selectedContract.title} className="w-full" />
                <Input type="text" defaultValue={selectedContract.party} className="w-full" />
                <Input type="date" defaultValue={selectedContract.date} className="w-full" />
                <Input type="number" defaultValue={selectedContract.amount} className="w-full" />
                <div className="flex gap-4 mt-2">
                  <Button 
                    type="button" 
                    onClick={() => setEditModalOpen(false)} 
                    className="flex-1 bg-gray-300 hover:bg-gray-400"
                  >
                    لغو
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-turquoise-600 text-white hover:bg-turquoise-700"
                  >
                    ذخیره
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-80 max-w-sm">
              <h2 className="text-xl font-bold text-turquoise-900 mb-4">حذف قرارداد</h2>
              <p className="text-turquoise-800 mb-4">آیا مطمئن هستید که می‌خواهید این قرارداد را حذف کنید؟</p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setDeleteModalOpen(false)} 
                  className="flex-1 bg-gray-300 hover:bg-gray-400"
                >
                  لغو
                </Button>
                <Button 
                  onClick={handleDelete} 
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                >
                  حذف
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
