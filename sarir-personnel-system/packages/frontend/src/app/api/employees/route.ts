
import { NextResponse } from "next/server";

export type Employee = {
  id: string;
  name: string;
  role: string;
  unit: string;
  birth?: string; // YYYY-MM-DD
};

// TODO: Replace with DB fetch (Prisma) when ready
const mock: Employee[] = [
  { id: "1", name: "محمد شاملو", role: "کارشناس فنی", unit: "IMEX", birth: "1991-03-02" },
  { id: "2", name: "مرجان خورشیدنیا", role: "اداری", unit: "SARIR", birth: "1996-07-21" },
  { id: "3", name: "مهدی علیپور", role: "کارشناس مالی", unit: "Finance" },
];

export async function GET(){
  return NextResponse.json({ data: mock });
}
