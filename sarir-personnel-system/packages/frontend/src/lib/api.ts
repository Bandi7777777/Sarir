const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export async function getPersonnel() {
  const res = await fetch(`${BASE}/personnel`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load personnel');
  return res.json();
}

export async function createPersonnel(payload: {
  first_name: string; last_name: string;
  emp_code?: string; phone?: string; email?: string; position?: string;
  department_id?: string;
}) {
  const res = await fetch(`${BASE}/personnel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = 'Failed to create personnel';
    try { const j = await res.json(); msg = j?.detail || j?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}



