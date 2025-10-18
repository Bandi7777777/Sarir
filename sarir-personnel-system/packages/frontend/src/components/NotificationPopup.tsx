"use client";

import React, { useState, useRef, useEffect } from "react";

/**
 * NotificationPopup (anchored)
 * - به دکمه می‌چسبد: ظرف والد relative است و منو absolute right-0 باز می‌شود.
 * - هیچ position: fixed یا right-* سراسری ندارد.
 */
export default function NotificationPopup() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // بستن با کلیک بیرون
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      const t = e.target as Node;
      if (!ref.current.contains(t)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const notifications = [
    { id: 1, title: "System update", body: "All services are healthy." },
    { id: 2, title: "Reminder", body: "HR form deadline is tomorrow." },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn btn-outline"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        Notifications
      </button>

      {open && (
        <div
          className="card absolute right-0 mt-2 w-80 p-3 shadow-lg z-20"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Notifications</h4>
            <button className="btn btn-outline" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className="card p-2">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm opacity-80">{n.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


