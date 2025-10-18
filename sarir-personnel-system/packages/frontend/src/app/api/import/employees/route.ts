import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RAW = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/+$/,"");
const baseNoApi = RAW.replace(/\/+$/,"");
const baseApi   = /\/api$/.test(baseNoApi) ? baseNoApi : `${baseNoApi}/api`;

async function xf(url: string, init?: RequestInit) {
  const r = await fetch(url, { ...init, cache: "no-store", headers: { "Content-Type": "application/json" } });
  const txt = await r.text();
  const type = r.headers.get("content-type") || "application/json";
  return new NextResponse(txt, { status: r.status, headers: { "content-type": type } });
}

export async function POST(req: Request) {
  const body = await req.text();
  const urls = [
    `${baseApi}/employees/bulk_import`,
    `${baseNoApi}/api/employees/bulk_import`,
  ];
  for (const u of urls) {
    try {
      return await xf(u, { method: "POST", body });
    } catch {}
  }
  return NextResponse.json({ error: "backend not reachable" }, { status: 502 });
}






