'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

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

type Props = {
  employeeId: string;        // UUID
  accessToken: string;       // Bearer
};

export default function DocumentsPanel({ employeeId, accessToken }: Props) {
  const [list, setList] = useState<Doc[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState('');
  const [catNew, setCatNew] = useState('general');

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const url = new URL('/api/documents', window.location.origin);
      url.searchParams.set('subject_type', 'employee');
      url.searchParams.set('subject_id', employeeId);
      if (category) url.searchParams.set('category', category);
      if (q) url.searchParams.set('q', q);

      const r = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.detail || `HTTP ${r.status}`);
      setList(Array.isArray(j) ? j : []);
    } catch (e: any) {
      setErr(e?.message || 'خطا در دریافت مدارک');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  const filtered = useMemo(() => list, [list]);

  async function onUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
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
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.detail || `HTTP ${r.status}`);
      // reset
      if (fileRef.current) fileRef.current.value = '';
      setTitle('');
      setCatNew('general');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'آپلود ناموفق بود');
      setLoading(false);
    }
  }

  async function onDelete(docId: string, hard = false) {
    if (!confirm(hard ? 'حذف کامل فایل؟' : 'آرشیو شود؟')) return;
    try {
      setLoading(true);
      setErr(null);
      const url = `/api/documents/${docId}` + (hard ? '?hard=true' : '');
      const r = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
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

  function fmtSize(n?: number | null) {
    if (!n || n <= 0) return '—';
    const kb = n / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* فیلترها */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            className="bg-white/10 border border-white/15 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40"
            placeholder="جستجو در عنوان/نام فایل…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/10 border border-white/15 rounded px-2 py-2 text-sm outline-none"
          >
            <option value="">همه‌ی دسته‌ها</option>
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
        </div>
        {loading && <span className="text-xs opacity-70">در حال بارگذاری…</span>}
        {err && <span className="text-xs text-rose-300">{err}</span>}
      </div>

      {/* آپلود */}
      <div className="border border-white/15 rounded-2xl bg-white/8 p-4 space-y-3">
        <div className="text-sm font-semibold text-cyan-100">افزودن مدرک جدید</div>
        <div className="grid md:grid-cols-4 gap-3">
          <input
            className="bg-white/10 border border-white/15 rounded px-3 py-2 text-sm outline-none"
            placeholder="عنوان (اختیاری)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            value={catNew}
            onChange={(e) => setCatNew(e.target.value)}
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
            className="px-3 py-2 bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#0b1220] rounded text-sm font-semibold"
            disabled={loading}
          >
            آپلود
          </button>
        </div>
      </div>

      {/* لیست مدارک */}
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 opacity-70">مدرکی موجود نیست.</td>
              </tr>
            ) : filtered.map(d => (
              <tr key={d.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-2">{d.title || '—'}</td>
                <td className="p-2">{d.category}</td>
                <td className="p-2">{d.file_name}</td>
                <td className="p-2">{fmtSize(d.file_size)}</td>
                <td className="p-2">{new Date(d.created_at).toLocaleDateString('fa-IR')}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <a
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/15"
                      href={`/api/documents/${d.id}/download`}
                      target="_blank" rel="noreferrer"
                    >
                      دانلود
                    </a>
                    <button
                      onClick={() => onDelete(d.id, false)}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/15"
                    >
                      آرشیو
                    </button>
                    <button
                      onClick={() => onDelete(d.id, true)}
                      className="px-2 py-1 rounded bg-rose-500/80 hover:bg-rose-500 text-[#0b1220] font-semibold"
                    >
                      حذف‌کامل
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
