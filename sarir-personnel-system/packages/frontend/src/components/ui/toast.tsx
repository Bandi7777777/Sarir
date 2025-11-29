"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastItem = {
  id: number;
  title?: string;
  description?: string;
  variant?: "default" | "warning" | "destructive";
};

const ToastCtx = createContext<{
  toast: (t: Omit<ToastItem, "id">) => void;
  remove: (id: number) => void;
  items: ToastItem[];
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const it: ToastItem = { id, ...t };
    setItems((arr) => [...arr, it]);
    // auto-hide
    setTimeout(() => {
      setItems((arr) => arr.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((arr) => arr.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastCtx.Provider value={{ toast, remove, items }}>
      {children}
      {/* Viewport */}
      <div dir="rtl" className="fixed bottom-4 right-4 z-50 space-y-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg px-4 py-3 shadow-lg border text-sm backdrop-blur
            ${
              t.variant === "destructive"
                ? "bg-red-500/20 border-red-400/40 text-red-100"
                : t.variant === "warning"
                ? "bg-amber-500/20 border-amber-400/40 text-amber-100"
                : "bg-gray-900/80 border-white/10 text-white"
            }`}
          >
            {t.title && <div className="font-bold mb-0.5">{t.title}</div>}
            {t.description && <div className="opacity-90">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    const noop = () => {};
    return { toast: noop, items: [] as ToastItem[], remove: noop };
  }
  return { toast: ctx.toast, items: ctx.items, remove: ctx.remove };
}
