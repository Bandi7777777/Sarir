"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// ⛳️ جایگزین سبکِ ترجمه (فعلاً بدون next-intl)
const t = (k: string) =>
  ({
    "Reports.title": "گزارش پرسنلی",
    "Reports.downloadPDF": "دانلود PDF",
    "Reports.downloadExcel": "دانلود Excel",
    "Reports.trendChartTitle": "روند تغییرات ماهانه",
    "Reports.tableHeaders.category": "دسته‌بندی",
    "Reports.tableHeaders.count": "تعداد",
  } as Record<string, string>)[k] || k;

interface ReportData {
  category: string;
  count: number;
}
interface TrendData {
  month: string;
  count: number;
}

const reportData: ReportData[] = [
  { category: "داخلی", count: 50 },
  { category: "قراردادها", count: 30 },
  { category: "اطلاعات پرسنلی", count: 45 },
  { category: "اطلاعات آدرس و تماس", count: 40 },
  { category: "اطلاعات بانکی", count: 35 },
  { category: "پزشکی", count: 25 },
];

const trendData: TrendData[] = [
  { month: "فروردین", count: 20 },
  { month: "اردیبهشت", count: 30 },
  { month: "خرداد", count: 25 },
  { month: "تیر", count: 40 },
  { month: "مرداد", count: 35 },
  { month: "شهریور", count: 50 },
];

export default function ReportsPage() {
  const [data] = useState<ReportData[]>(reportData);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Reports.title", 105, 10, { align: "center" });
    const tableData = data.map((item) => [item.count, item.category]);
    (doc as any).autoTable({
      head: [["Reports.tableHeaders.count", "Reports.tableHeaders.category"]],
      body: tableData,
      startY: 20,
      styles: { halign: "right" },
    });
    doc.save("personnel-report.pdf");
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "گزارش پرسنلی");
    XLSX.writeFile(wb, "personnel-report.xlsx");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#D1EAF2] to-[#F9FDFF]">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{"Reports.title"}</h1>

        <div className="flex justify-end mb-6 gap-3">
          <button
            onClick={downloadPDF}
            className="bg-[#4DA8FF] text-white px-4 py-2 rounded-md hover:bg-[#66B2FF] text-sm transition-all duration-200"
          >
            {"Reports.downloadPDF"}
          </button>
          <button
            onClick={downloadExcel}
            className="bg-[#28A745] text-white px-4 py-2 rounded-md hover:bg-[#34C759] text-sm transition-all duration-200"
          >
            {"Reports.downloadExcel"}
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-md overflow-x-auto mb-8">
          <table className="w-full text-sm text-gray-800">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-right">{"Reports.tableHeaders.category"}</th>
                <th className="py-3 px-4 text-right">{"Reports.tableHeaders.count"}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.category} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-right">{item.category}</td>
                  <td className="py-3 px-4 text-right">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">{"Reports.trendChartTitle"}</h2>
          <div className="flex justify-center">
            <LineChart width={600} height={300} data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#4DA8FF" activeDot={{ r: 7 }} />
            </LineChart>
          </div>
        </div>
      </div>
    </div>
  );
}






