import { NextResponse } from "next/server";

export type Report = {
  id: number;
  category: string;
  count: number;
  description: string;
  subData?: Report[];
};

// in-memory (برای تست فرانت‌اند)
let REPORTS: Report[] = [
  { id: 1, category: "داخلی", count: 50, description: "گزارش‌های داخلی", subData: [{ id: 11, category: "زیرمجموعه 1", count: 20, description: "" }, { id: 12, category: "زیرمجموعه 2", count: 30, description: "" }] },
  { id: 2, category: "قراردادها", count: 30, description: "قراردادهای پرسنلی", subData: [{ id: 21, category: "A", count: 15, description: "" }, { id: 22, category: "B", count: 15, description: "" }] },
  { id: 3, category: "اطلاعات پرسنلی", count: 45, description: "جزئیات کارکنان" },
  { id: 4, category: "آدرس و تماس", count: 40, description: "اطلاعات تماس" },
  { id: 5, category: "اطلاعات بانکی", count: 35, description: "جزئیات حساب‌ها" },
  { id: 6, category: "پزشکی", count: 25, description: "سلامت و پزشکی" }
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
  REPORTS = REPORTS.map(r => (r.id === body.id ? body : r));
  return NextResponse.json(body, { status: 200 });
}

export async function DELETE(req: Request) {
  const { id } = (await req.json()) as { id: number };
  REPORTS = REPORTS.filter(r => r.id !== id);
  return NextResponse.json({ id }, { status: 200 });
}
