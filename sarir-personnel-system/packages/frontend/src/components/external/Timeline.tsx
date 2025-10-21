"use client";

import React from "react";

export type TimelineItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  right?: React.ReactNode;
  dotColor?: string;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative pl-6">
      <div className="absolute top-0 bottom-0 left-2 w-px bg-gradient-to-b from-[#07657E33] to-[#F2991F33]" />
      <ul className="space-y-6">
        {items.map((it) => (
          <li key={it.id} className="relative">
            <span
              className="absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-2 ring-white shadow"
              style={{ backgroundColor: it.dotColor || "#07657E" }}
            />
            <div className="card p-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#07657E]">{it.title}</h3>
                {it.subtitle && <div className="text-xs text-gray-500 mt-1">{it.subtitle}</div>}
                {it.description && <p className="text-sm mt-2">{it.description}</p>}
              </div>
              {it.right && <div className="text-sm">{it.right}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
