/// <reference lib="webworker" />
import * as XLSX from "xlsx";

declare const self: DedicatedWorkerGlobalScope;

function post(type: string, payload?: any) {
  self.postMessage({ type, payload });
}
function progress(phase: "parsing"|"reading", pct: number) {
  self.postMessage({ type:"progress", phase, progress: pct });
}

self.onmessage = async (ev: MessageEvent) => {
  try {
    const { type, payload } = ev.data || {};
    if (type === "parse-text") {
      const text: string = payload.text || "";
      const isTSV: boolean = !!payload.isTSV;

      progress("parsing", 10);
      const data = isTSV ? text.replace(/\t/g, ",") : text;
      const wb = XLSX.read(data, { type: "string" });
      progress("parsing", 40);

      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "" });
      progress("parsing", 70);

      const headers = (raw[0] || []) as string[];
      const rows: Record<string, any>[] = [];
      for (let i=1; i<raw.length; i++) {
        const row: Record<string, any> = {};
        headers.forEach((h, j) => (row[h] = raw[i][j]));
        rows.push(row);
      }
      progress("parsing", 100);
      post("parsed", { headers, rows });
      return;
    }

    if (type === "parse-arraybuffer") {
      const buf: ArrayBuffer = payload;
      progress("parsing", 10);
      const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
      progress("parsing", 40);

      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "" });
      progress("parsing", 80);

      const headers = (raw[0] || []) as string[];
      const rows: Record<string, any>[] = [];
      for (let i=1; i<raw.length; i++) {
        const row: Record<string, any> = {};
        headers.forEach((h, j) => (row[h] = raw[i][j]));
        rows.push(row);
      }
      progress("parsing", 100);
      post("parsed", { headers, rows });
      return;
    }
  } catch (e: any) {
    post("error", { error: e?.message || String(e) });
  }
};
