"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";

/**
 * صفحهٔ تایید QR
 * پارامترها از کوئری‌استرینگ می‌آید: ?title=...&date=YYYY-MM-DD&time=HH:mm
 * فعلاً Mock است؛ بعداً می‌توانیم با /api/meetings/:id وضعیت واقعی را بخوانیم.
 */

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      suppressHydrationWarning
      autoComplete="off"
      data-1p-ignore
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring w-full ${className || ""}`}
    />
  );
}

// نکتهٔ مهم:
// به‌جای تعریف PageProps متناقض با تایپ‌های Next، از props: any استفاده می‌کنیم
// و خودمان searchParams را به ساختار موردنیاز cast می‌کنیم.
// این کار مشکل TypeScript در .next/types را حل می‌کند، بدون تغییر رفتار صفحه.

export default function VerifyMeetingPage(props: any) {
  const searchParams =
    (props?.searchParams as { [key: string]: string | string[] | undefined } | undefined) ?? {};

  // گرفتن پارامترها
  const title =
    typeof searchParams.title === "string"
      ? decodeURIComponent(searchParams.title)
      : "جلسه هیئت‌مدیره";
  const date = typeof searchParams.date === "string" ? searchParams.date : "";
  const time = typeof searchParams.time === "string" ? searchParams.time : "";

  // وضعیت امضا/انتشار (Mock)
  const [signed, setSigned] = useState(false);
  const [published, setPublished] = useState(false);

  // پیوست‌ها (Mock) — بعداً از API پر می‌شود
  const [attachments, setAttachments] = useState<string[]>([]);

  const statusText = useMemo(() => {
    if (published) return "منتشرشده";
    if (signed) return "امضا شده";
    return "در انتظار تایید";
  }, [signed, published]);

  async function handleApprove() {
    setSigned(true);
    toast.success("تایید شد (نمونه)");
  }
  async function handleReject() {
    setSigned(false);
    setPublished(false);
    toast("رد شد (نمونه)");
  }
  async function handlePublish() {
    if (!signed) return toast.error("ابتدا باید امضا شود");
    setPublished(true);
    toast.success("منتشر شد (نمونه)");
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/meetings/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (j.ok) {
        setAttachments((s) => [j.url as string, ...s]);
        toast.success("پیوست آپلود شد");
      } else {
        toast.error("آپلود ناکام");
      }
    } catch {
      toast.error("خطا در ارتباط");
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(100rem 52rem at 110% -20%, rgba(7,101,126,.12), transparent), radial-gradient(80rem 48rem at -10% 120%, rgba(242,153,31,.12), transparent), #eef3f7",
      }}
    >
      <div className="w-full max-w-3xl bg-white/90 border border-white/40 rounded-2xl shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#07657E]">تایید جلسه</h1>
          <Link href="/board/list" className="text-sm text-blue-700 underline">
            بازگشت به لیست
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="p-3 rounded-xl bg-[#07657E]/10 border border-[#07657E]/20">
            <div className="text-xs text-[#07657E]/80">عنوان</div>
            <div className="font-bold text-[#2E3234]">{title}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#F2991F]/10 border border-[#F2991F]/20">
            <div className="text-xs text-[#F2991F]/80">تاریخ/ساعت</div>
            <div className="font-bold text-[#2E3234]">
              {date || "—"} {time ? `— ${time}` : ""}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#1FB4C8]/10 border border-[#1FB4C8]/20 md:col-span-2">
            <div className="text-xs text-[#07657E]/80">وضعیت</div>
            <div className="font-bold text-[#2E3234]">{statusText}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold text-[#07657E] mb-2">پیوست‌ها</div>
          <div className="flex items-center gap-2 mb-3">
            <label className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 cursor-pointer">
              بارگذاری پیوست
              <input type="file" hidden onChange={onUpload} />
            </label>
            <span className="text-xs text-gray-500">PDF/تصویر/…</span>
          </div>
          {attachments.length === 0 ? (
            <div className="text-sm text-gray-500">پیوستی ثبت نشده است.</div>
          ) : (
            <ul className="space-y-2">
              {attachments.map((u, i) => (
                <li key={i} className="text-sm">
                  <a href={u} target="_blank" className="text-blue-700 underline">
                    {u}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={handleApprove}
            className="px-3 py-2 rounded-md text-white"
            style={{ background: "linear-gradient(90deg,#10b981,#059669)" }}
          >
            تایید
          </button>
          <button
            onClick={handleReject}
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
          >
            رد
          </button>
          <button
            onClick={handlePublish}
            className="px-3 py-2 rounded-md text-white"
            style={{ background: "linear-gradient(90deg,#2563eb,#1d4ed8)" }}
          >
            انتشار
          </button>
        </div>
      </div>
    </div>
  );
}
