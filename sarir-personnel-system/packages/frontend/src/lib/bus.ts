// Lightweight event bus using BroadcastChannel (across tabs)
export type EmployeeEvent =
  | { type: "employee.updated"; id: string | number; payload?: unknown }
  | { type: "employee.deleted"; id: string | number };

const CH = "sarir-employee-bus";

export function publishEmployeeUpdated(id: string | number, payload?: unknown) {
  try { const bc = new BroadcastChannel(CH); bc.postMessage({ type: "employee.updated", id, payload } as EmployeeEvent); bc.close(); } catch {}
}
export function publishEmployeeDeleted(id: string | number) {
  try { const bc = new BroadcastChannel(CH); bc.postMessage({ type: "employee.deleted", id } as EmployeeEvent); bc.close(); } catch {}
}
export function subscribeEmployeeEvents(onMsg: (e: EmployeeEvent)=>void) {
  let bc: BroadcastChannel | null = null;
  try { bc = new BroadcastChannel(CH); bc.onmessage = (ev)=>{ const data = ev.data as EmployeeEvent; if (data?.type?.startsWith("employee.")) onMsg(data); }; } catch {}
  return ()=>{ try { bc?.close(); } catch {} };
}
