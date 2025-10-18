'use client';
import { useEffect, useState } from "react";
function fmt(now: Date) {
  try {
    const d = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { calendar: 'persian', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const t = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { calendar: 'persian', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
    return `${d} - ${t}`;
  } catch { return now.toLocaleString(); }
}
export default function Clock() {
  const [text, setText] = useState<string>('');
  useEffect(() => { const tick = () => setText(fmt(new Date())); tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);
  return <div className="text-2xl font-bold tabular-nums tracking-wide">{text || "—"}</div>;
}
