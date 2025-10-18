// packages/frontend/src/app/api/holidays/route.ts
import { NextResponse } from "next/server";

/**
 * GET /api/holidays?y=1404&m=07
 * برمی‌گرداند: { "1404-07-01": "عنوان", ... }
 * اگر y/m نیاید، ماهِ جلالیِ فعلی را خودش محاسبه می‌کند.
 */
function toEnDigits(s: string) {
  const map: Record<string, string> = {
    "۰": "0","۱": "1","۲": "2","۳": "3","۴": "4",
    "۵": "5","۶": "6","۷": "7","۸": "8","۹": "9",
    "٠": "0","١": "1","٢": "2","٣": "3","٤": "4",
    "٥": "5","٦": "6","٧": "7","٨": "8","٩": "9",
  };
  return s.replace(/[۰-۹٠-٩]/g, (d) => map[d]);
}
function jalaliParts(d: Date) {
  const y = new Intl.DateTimeFormat("fa-IR-u-ca-persian",{year:"numeric"}).format(d);
  const m = new Intl.DateTimeFormat("fa-IR-u-ca-persian",{month:"2-digit"}).format(d);
  return { y: +toEnDigits(y), m: +toEnDigits(m) };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let y = url.searchParams.get("y");
    let m = url.searchParams.get("m");

    if (!y || !m) {
      const now = jalaliParts(new Date());
      y = String(now.y);
      m = String(now.m).padStart(2, "0");
    } else {
      m = String(m).padStart(2, "0");
    }

    // روزهای ماه جلالی (حداکثر 31 درخواست؛ اگر روزی نبود، صرفاً نادیده می‌گیریم)
    const days = 31;
    const map: Record<string, string> = {};
    const tasks: Promise<void>[] = [];

    for (let d = 1; d <= days; d++) {
      const dd = String(d).padStart(2, "0");
      const api = `https://holidayapi.ir/jalali/${y}/${m}/${dd}`;
      tasks.push(
        fetch(api, { cache: "no-store" })
          .then(r => (r.ok ? r.json() : null))
          .then(data => {
            if (!data || !Array.isArray(data?.events)) return;
            const titles = data.events
              .map((e: any) => String(e?.description || "").trim())
              .filter(Boolean);
            if (titles.length) {
              const key = `${y}-${m}-${dd}`;
              map[key] = titles.join("، ");
            }
          })
          .catch(() => {})
      );
    }

    await Promise.all(tasks);
    return NextResponse.json(map, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "holiday fetch failed" }, { status: 500 });
  }
}
