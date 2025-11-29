import { NextResponse } from "next/server";

export type Report = {
  id: number;
  category: string;
  count: number;
  description: string;
  subData?: Report[];
};

// in-memory (فقط برای نمونه‌سازی)
let REPORTS: Report[] = [
  {
    id: 1,
    category: "گزارش‌های داخلی",
    count: 50,
    description: "جمع‌بندی دوره‌ای واحدها",
    subData: [
      { id: 11, category: "ریزگزارش ۱", count: 20, description: "گزارش تفصیلی واحدها" },
      { id: 12, category: "ریزگزارش ۲", count: 30, description: "شاخص‌های کنترلی آماده" },
    ],
  },
  {
    id: 2,
    category: "قراردادها",
    count: 30,
    description: "وضعیت قراردادهای پرسنلی",
    subData: [
      { id: 21, category: "A", count: 15, description: "پرونده‌های اولویت‌دار" },
      { id: 22, category: "B", count: 15, description: "قراردادهای آماده امضا" },
    ],
  },
  { id: 3, category: "پایش انطباق", count: 45, description: "هشدارهای کلیدی" },
  { id: 4, category: "حضور و غیاب", count: 40, description: "تاخیرها و اضافه‌کار" },
  { id: 5, category: "گزارش‌های هیئت", count: 35, description: "جلسات و مصوبات" },
  { id: 6, category: "سوابق", count: 25, description: "سوابق و آرشیو" },
];

export async function GET() {
  return NextResponse.json(REPORTS, { status: 200 });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Omit<Report, "id">;
  const newItem: Report = { id: Date.now(), ...body };
  REPORTS.unshift(newItem);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Report;
  REPORTS = REPORTS.map((r) => (r.id === body.id ? body : r));
  return NextResponse.json(body, { status: 200 });
}

export async function DELETE(req: Request) {
  const { id } = (await req.json()) as { id: number };
  REPORTS = REPORTS.filter((r) => r.id !== id);
  return NextResponse.json({ id }, { status: 200 });
}
