type ApiLog = { url: string; ok: boolean; status: number; ms: number };
let OK_COUNT = 0, ERR_COUNT = 0;

export function logApi(entry: ApiLog) {
  if (entry.ok) OK_COUNT++; else ERR_COUNT++;
  const tag = entry.ok ? "✅" : "❌";
  // ساده: کنسول. (در آینده: ارسال به سرور)
  // eslint-disable-next-line no-console
  console.log(`${tag} [API] ${entry.status} ${entry.ms}ms ${entry.url} | ok=${OK_COUNT} err=${ERR_COUNT}`);
}
