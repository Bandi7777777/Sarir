// نوع داده برای خطاهای API
export interface ApiError {
  detail: string;
  status: number;
}

// کلاینت اصلی درخواست‌ها
export async function apiClient<T>(
  endpoint: string, 
  { body, ...customConfig }: RequestInit = {}
): Promise<T> {
  // به دلیل استفاده از Rewrites در Next.config، نیازی به نوشتن http://localhost:8000 نیست
  // فقط /api/users کافیست.
  const headers = { 'Content-Type': 'application/json' };
  
  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // حذف اسلش اول آدرس برای اطمینان
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // درخواست به مسیر نسبی (که توسط Next.js به بک‌اند پروکسی می‌شود)
  const response = await fetch(`/api${cleanEndpoint}`, config);

  if (response.ok) {
    // اگر پاسخ خالی بود (مثلاً 204)
    if (response.status === 204) return {} as T;
    return await response.json();
  }

  // مدیریت خطا
  const errorText = await response.text();
  let errorMessage = errorText;
  
  try {
    const jsonError = JSON.parse(errorText);
    errorMessage = jsonError.detail || jsonError.message || errorText;
  } catch {}

  const error = new Error(errorMessage) as Error & { status: number };
  error.status = response.status;
  throw error;
}

/* مثال استفاده:
  import { apiClient } from '@/lib/api-client';
  
  const data = await apiClient<UserType>('/users/me');
*/