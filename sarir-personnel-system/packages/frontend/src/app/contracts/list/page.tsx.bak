"use client";

import Sidebar from "@/components/ui/Sidebar";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { DocumentIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function ContractsList() {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<string[]>([]);

  const contractsData = useMemo(
    () => [
      {
        id: 1,
        title: "قرارداد حمل و نقل",
        party: "شرکت X",
        date: "2025-07-01",
        amount: "10000000",
      },
      {
        id: 2,
        title: "قرارداد خدمات",
        party: "شرکت Y",
        date: "2025-06-15",
        amount: "5000000",
      },
    ],
    []
  );

  const filteredContracts = contractsData.filter(
    (contract) =>
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.party.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#EAF6F9] to-[#A3D8F4] dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white animate-gradient-bg">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <div
        className="flex-1 p-4 md:p-8 space-y-8 transition-all duration-300"
        style={{ paddingRight: expanded ? "280px" : "80px" }}
      >
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg p-6 rounded-b-xl shadow-xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A8A9F] dark:text-[#66B2FF] animate-neon-text">
            لیست قراردادها
          </h1>
        </motion.header>

        {/* Notifications */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="hidden fixed top-4 right-4 z-60 bg-green-500/80 text-white p-4 rounded-lg shadow-lg animate-slide-down"
          >
            {notifications[0]}{" "}
            <button
              onClick={() => setNotifications([])}
              className="ml-3 text-white hover:text-gray-200"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Search Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-2xl shadow-xl animate-slide-up"
        >
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[#0A8A9F] dark:text-[#66B2FF]" />
            <Input
              aria-label="جستجو"
              type="text"
              placeholder="جستجوی قرارداد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-[#0A8A9F] text-lg pl-12"
            />
          </div>
          <ul className="space-y-4">
            {filteredContracts.map((contract) => (
              <motion.li
                key={contract.id}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-4 rounded-xl bg-[#F0FAFB]/90 dark:bg-gray-700/90"
              >
                <div className="flex items-center gap-4">
                  <DocumentIcon className="h-8 w-8 text-[#0A8A9F] dark:text-[#66B2FF]" />
                  <div>
                    <p className="text-lg text-gray-900 dark:text-gray-200">
                      {contract.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      طرف قرارداد: {contract.party} - تاریخ: {contract.date} -
                      مبلغ: {contract.amount}
                    </p>
                  </div>
                </div>
                <Button
                  variant="link"
                  className="text-[#0A8A9F] dark:text-[#66B2FF] hover:text-[#007A9A] text-lg"
                >
                  جزئیات
                </Button>
              </motion.li>
            ))}
          </ul>
        </motion.section>
      </div>
    </div>
  );
}







