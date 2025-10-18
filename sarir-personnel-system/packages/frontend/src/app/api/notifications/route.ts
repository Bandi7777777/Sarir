import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// مقدار محیط را می‌گیریم و فقط یک اسلش پایانی را حذف می‌کنیم
const RAW = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/+$/,"");

// اگر RAW خودش /api داشت، baseApi همان RAW است؛ اگر نداشت، baseApi = RAW + /api
const baseNoApi = RAW.replace(/\/+$/,"");
const baseApi   = /\/api$/.test(baseNoApi) ? baseNoApi : `${baseNoApi}/api`;

const TIMEOUT_MS = 10_000;

async function proxyFetch(input: RequestInfo, init?: RequestInit) {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    return await fetch(input, {
      ...init,
      signal: ctl.signal,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
  } finally {
    clearTimeout(id);
  }
}

// کاندیداهای مطمئن برای GET
function candidateGetUrls() {
  return [
    `${baseApi}/notifications/`,
    `${baseApi}/notifications`,
    `${baseNoApi}/api/notifications/`,
    `${baseNoApi}/api/notifications`,
  ];
}

// کاندیداهای مطمئن برای آیتم با id
function candidateItemUrls(id: string | number) {
  return [
    `${baseApi}/notifications/${id}/`,
    `${baseApi}/notifications/${id}`,
    `${baseNoApi}/api/notifications/${id}/`,
    `${baseNoApi}/api/notifications/${id}`,
  ];
}

/* ---------------- GET /api/notifications ---------------- */
export async function GET() {
  try {
    for (const u of candidateGetUrls()) {
      const r = await proxyFetch(u, { method: "GET" });
      if (r.status === 404) continue;
      const txt  = await r.text();
      const type = r.headers.get("content-type") || "application/json";
      if (!r.ok) return new NextResponse(txt, { status: r.status, headers: { "content-type": type } });
      return new NextResponse(txt, { status: 200, headers: { "content-type": type } });
    }
    // بک‌اند این مسیر را ندارد → آرایه‌ی خالی
    return NextResponse.json([], { status: 200 });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Upstream timeout" : (e?.message || "Upstream error");
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

/* ---------------- PATCH /api/notifications  body:{id,unread} ---------------- */
export async function PATCH(req: Request) {
  try {
    const { id, unread } = await req.json().catch(() => ({}));
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    for (const u of candidateItemUrls(id)) {
      const r = await proxyFetch(`${u}?unread=${encodeURIComponent(String(unread))}`, { method: "PATCH" });
      if (r.status === 404) continue;
      const txt  = await r.text();
      const type = r.headers.get("content-type") || "application/json";
      return new NextResponse(txt, { status: r.status, headers: { "content-type": type } });
    }
    return NextResponse.json({ error: "Not implemented in backend" }, { status: 501 });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Upstream timeout" : (e?.message || "Upstream error");
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

/* ---------------- DELETE /api/notifications  body:{id} ---------------- */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json().catch(() => ({}));
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    for (const u of candidateItemUrls(id)) {
      const r = await proxyFetch(u, { method: "DELETE" });
      if (r.status === 404) continue;
      return NextResponse.json({ ok: r.ok, status: r.status }, { status: r.status });
    }
    return NextResponse.json({ error: "Not implemented in backend" }, { status: 501 });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Upstream timeout" : (e?.message || "Upstream error");
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}






