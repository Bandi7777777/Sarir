import { NextResponse } from "next/server";

/**
 * Next.js 15 note:
 * - ctx.params به صورت Promise تایپ می‌شود؛ باید await شود.
 * - این فایل فقط امضای متدها را با استاندارد جدید همسو می‌کند.
 * - منطق داخلی فعلاً ساده و ایمن نگه داشته شده تا بیلد بخورد.
 *   در صورت نیاز، بعداً به منبع دادهٔ واقعی متصلش می‌کنیم.
 */

type Employee = {
  id: string;
  name?: string;
  role?: string;
  // ... هر فیلد دیگری که در پروژه‌ات داری
};

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  // TODO: به منبع دادهٔ واقعی وصل شود.
  // فعلاً پاسخ حداقلی برای جلوگیری از خطای بیلد/ران‌تایم:
  const data: Employee = { id, name: "Employee " + id, role: "N/A" };

  return NextResponse.json({ ok: true, data });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await safeJson<Employee>(req);

  // TODO: update واقعی
  return NextResponse.json({
    ok: true,
    message: "Employee updated (mock)",
    id,
    body,
  });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await safeJson<Partial<Employee>>(req);

  // TODO: patch واقعی
  return NextResponse.json({
    ok: true,
    message: "Employee patched (mock)",
    id,
    body,
  });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  // TODO: delete واقعی
  return NextResponse.json({
    ok: true,
    message: "Employee deleted (mock)",
    id,
  });
}

/** helper: JSON body را ایمن parse می‌کند */
async function safeJson<T>(req: Request): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text) return null as any;
    return JSON.parse(text) as T;
  } catch {
    return null as any;
  }
}
