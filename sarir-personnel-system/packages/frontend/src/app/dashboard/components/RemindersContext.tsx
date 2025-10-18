'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Reminder = {
  id: string;
  title: string;
  date: string;     // YYYY-MM-DD
  time?: string;    // HH:mm
  note?: string;
  createdAt: number;
  important?: boolean;
};

type Ctx = {
  reminders: Reminder[];
  addReminder: (r: Omit<Reminder, "id" | "createdAt">) => void;
  removeReminder: (id: string) => void;
  toggleImportant: (id: string) => void;
  clearAll: () => void;
};

const RemindersCtx = createContext<Ctx | null>(null);

export function RemindersProvider({
  children,
  storageKey = "sarir_dashboard_reminders_v1",
}: { children: React.ReactNode; storageKey?: string; }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setReminders(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reminders));
    } catch {}
  }, [reminders, storageKey]);

  const addReminder = useCallback((r: Omit<Reminder, "id" | "createdAt">) => {
    setReminders(prev => [...prev, { ...r, id: crypto.randomUUID(), createdAt: Date.now() }]);
  }, []);

  const removeReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(x => x.id !== id));
  }, []);

  const toggleImportant = useCallback((id: string) => {
    setReminders(prev => prev.map(x => x.id === id ? { ...x, important: !x.important } : x));
  }, []);

  const clearAll = useCallback(() => setReminders([]), []);

  const value = useMemo(() => ({ reminders, addReminder, removeReminder, toggleImportant, clearAll }), [reminders, addReminder, removeReminder, toggleImportant, clearAll]);
  return <RemindersCtx.Provider value={value}>{children}</RemindersCtx.Provider>;
}

export function useReminders(): Ctx {
  const ctx = useContext(RemindersCtx);
  if (!ctx) throw new Error("useReminders must be used inside <RemindersProvider>");
  return ctx;
}
