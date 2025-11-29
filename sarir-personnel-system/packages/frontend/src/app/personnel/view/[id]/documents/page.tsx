'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */ // TODO: refine personnel documents types
/* eslint-disable react/no-unescaped-entities */ // TODO: fix copy text encoding

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Doc = {
  id: string;
  subject_type: string;
  subject_id?: string | null;
  title?: string | null;
  category: string;
  file_name: string;
  file_size?: number | null;
  mime_type?: string | null;
  checksum_sha256?: string | null;
  uploaded_by?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export default function EmployeeDocumentsPage() {
  const { id: employeeId } = useParams() as { id: string };

  const [list, setList] = useState<Doc[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // توکن اختیاری برای عملیات (آپلود/دانلود/حذف)
  const [access, setAccess] = useState<string>('');      // مقدار اولیه خالی تا SSR/CSR همسان باشد
  useEffect(() => {
    try { setAccess(sessionStorage.getItem('sarir_access_token') || ''); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // فقط یک‌بار

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState('');
  const [catNew, setCatNew] = useState('general');

  function fmtSize(n?: number | null) {
    if (!n || n <= 0) return '—';
    const kb = n / 1024;
    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(2)} MB`;
  }

  const load = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setErr(null);
      const url = new URL('/api/documents', window.location.origin);
      url.searchParams.set('subject_type', 'employee');
      url.searchParams.set('subject_id', employeeId);
      if (category) url.searchParams.set('category', category);
      if (q) url.searchParams.set('q', q);

      const headers: Record<string, string> = {};
      if (access) headers.Authorization = `Bearer ${access}`; // اختیاری: اگر داشتی، بفرست

      const r = await fetch(url.toString(), { headers, cache: 'no-store' });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.detail || `HTTP ${r.status}`);
      setList(Array.isArray(j) ? j : []);
    } catch (e: any) {
      setErr(e?.message || 'خطا در دریافت مدارک');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load handles its own deps
  }, [employeeId, access]);

  const canUpload = Boolean(access);

  async function onUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file || !employeeId || !access) return;
    try {
      setLoading(true);
      setErr(null);
      const form = new FormData();
      form.append('subject_type', 'employee');
      form.append('subject_id', employeeId);
      if (title) form.append('title', title);
      form.append('category', catNew || 'general');
      form.append('file', file);

      const r = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${access}` },
        body: form,
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.detail || `HTTP ${r.status}`);

      if (fileRef.current) fileRef.current.value = '';
      setTitle(''); setCatNew('general');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'آپلود ناموفق بود');
      setLoading(false);
    }
  }

  async function onDelete(docId: string, hard = false) {
    if (!access) return alert('برای حذف/آرشیو باید ورود کنید.');
    if (!confirm(hard ? 'حذف کامل؟' : 'آرشیو شود؟')) return;
    try {
      setLoading(true);
      setErr(null);
      const r = await fetch(`/api/documents/${docId}${hard ? '?hard=true' : ''}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!r.ok && r.status !== 204) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.detail || `HTTP ${r.status}`);
      }
      await load();
    } catch (e: any) {
      setErr(e?.message || 'حذف/آرشیو ناموفق بود');
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      suppressHydrationWarning   // ← اگر افزونه‌های مرورگر صفات data-* تزریق کنند، خطا نگیر
      className="min-h-screen p-6 md:p-10 text-cyan-50"
      style={{ background: "radial-gradient(120rem 70rem at 120% -10%, rgba(34,211,238,.18), transparent), radial-gradient(100rem 60rem at -10% 120%, rgba(99,102,241,.18), transparent), #0b1220" }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-xl font-bold">مدارک پرسنل #{employeeId}</div>

        {/* فیلتر */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <input
            className="bg-white/10 border border-white/15 rounded px-3 py-2 text-sm outline-none"
            placeholder="جستجو در عنوان/نام فایل…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-white/10 border border-white/15 rounded px-2 py-2 text-sm outline-none"
          >
            <option value="">همهٔ دسته‌ها</option>
            <option value="general">general</option>
            <option value="id">id</option>
            <option value="contract">contract</option>
            <option value="license">license</option>
            <option value="education">education</option>
          </select>
          <button
            onClick={load}
            className="px-3 py-2 bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220] rounded text-sm font-semibold"
          >
            اعمال فیلتر
          </button>

          {/* پیام ثابت برای جلوگیری از اختلاف SSR/CSR */}
          <span className="text-xs opacity-80">
            برای آپلود/دانلود، پس از ورود توکن را در نشست ذخیره کنید:
            <code> sessionStorage.setItem('sarir_access_token','&lt;TOKEN&gt;')</code>
          </span>
        </div>

        {/* آپلود */}
        <div className="border border-white/15 rounded-2xl bg-white/8 p-4 space-y-3">
          <div className="text-sm font-semibold text-cyan-100">افزودن مدرک جدید</div>
          <div className="grid md:grid-cols-4 gap-3">
            <input
              className="bg-white/10 border border-white/15 rounded px-3 py-2 text-sm outline-none"
              placeholder="عنوان (اختیاری)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <select
              value={catNew}
              onChange={e => setCatNew(e.target.value)}
              className="bg-white/10 border border-white/15 rounded px-2 py-2 text-sm outline-none"
            >
              <option value="general">general</option>
              <option value="id">id</option>
              <option value="contract">contract</option>
              <option value="license">license</option>
              <option value="education">education</option>
            </select>
            <input
              ref={fileRef}
              type="file"
              className="block w-full text-sm text-cyan-50 file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-400 file:text-[#0b1220] hover:file:bg-cyan-300 bg-white/10 border border-white/15 rounded"
            />
            <button
              onClick={onUpload}
              disabled={!canUpload || loading}
              className={"px-3 py-2 rounded text-sm font-semibold " + (canUpload ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220]" : "bg-white/10 text-cyan-200/60 cursor-not-allowed")}
              title={canUpload ? "" : "برای آپلود ابتدا وارد شوید"}
            >
              آپلود
            </button>
          </div>
        </div>

        {/* لیست */}
        <div className="border border-white/15 rounded-2xl bg-white/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/10">
              <tr className="text-cyan-100">
                <th className="text-right p-2">عنوان</th>
                <th className="text-right p-2">دسته</th>
                <th className="text-right p-2">نام فایل</th>
                <th className="text-right p-2">حجم</th>
                <th className="text-right p-2">تاریخ</th>
                <th className="text-right p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 opacity-70">در حال بارگذاری…</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={6} className="p-4 opacity-70">{err || "مدرکی موجود نیست."}</td></tr>
              ) : (
                list.map(d => (
                  <tr key={d.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-2">{d.title || '—'}</td>
                    <td className="p-2">{d.category}</td>
                    <td className="p-2">{d.file_name}</td>
                    <td className="p-2">{fmtSize(d.file_size)}</td>
                    <td className="p-2">{new Date(d.created_at).toLocaleDateString('fa-IR')}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <a
                          className={"px-2 py-1 rounded " + (canUpload ? "bg-white/10 hover:bg-white/15" : "bg-white/5 cursor-not-allowed")}
                          href={`/api/documents/${d.id}/download`}
                          target="_blank" rel="noreferrer"
                          onClick={(e) => { if (!canUpload) e.preventDefault(); }}
                        >
                          دانلود
                        </a>
                        <button
                          onClick={() => onDelete(d.id, false)}
                          disabled={!canUpload}
                          className={"px-2 py-1 rounded " + (canUpload ? "bg-white/10 hover:bg-white/15" : "bg-white/5 cursor-not-allowed")}
                        >
                          آرشیو
                        </button>
                        <button
                          onClick={() => onDelete(d.id, true)}
                          disabled={!canUpload}
                          className={"px-2 py-1 rounded " + (canUpload ? "bg-rose-500/80 hover:bg-rose-500 text-[#0b1220] font-semibold" : "bg-white/5 text-cyan-200/60 cursor-not-allowed")}
                        >
                          حذف‌کامل
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {err && <div className="text-rose-300 text-sm">{err}</div>}
      </div>
    </div>
  );
}
