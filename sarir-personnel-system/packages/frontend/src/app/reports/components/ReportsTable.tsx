import React from "react";
import type { Row, Table } from "@tanstack/react-table";
import type { VirtualItem } from "@tanstack/react-virtual";

import { Button } from "@/components/ui/button";

import type { Report } from "@/app/api/reports/route";
import type { Density } from "../types";

type ReportsTableProps = {
  table: Table<Report>;
  virtualItems: VirtualItem[];
  paddingTop: number;
  paddingBottom: number;
  density: Density;
  selectedIds: Set<number>;
  toggleSelectAll: () => void;
  toggleOne: (id: number) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
};

export function ReportsTable({
  table,
  virtualItems,
  paddingTop,
  paddingBottom,
  density,
  selectedIds,
  toggleSelectAll,
  toggleOne,
  scrollRef,
}: ReportsTableProps) {
  const rows = table.getRowModel().rows;
  return (
    <div className="table-wrap glass p-2">
      <div className="table-head flex items-center justify-between p-4">
        <h2 className="text-sm font-medium text-[#cfe3ff]">گزارش‌ها ({rows.length})</h2>
        <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="chip">
          انتخاب همه
        </Button>
      </div>
      <div
        style={{
          height: density === "dense" ? 360 : density === "compact" ? 300 : 460,
          overflow: "auto",
        }}
        ref={scrollRef}
      >
        <table className="w-full text-right text-sm">
          <thead className="sticky top-0 bg-[#0b1220]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="w-8 px-4 py-3" />
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : header.column.columnDef.header as React.ReactNode}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} colSpan={table.getAllColumns().length + 1} />
              </tr>
            )}
            {virtualItems.map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<Report>;
              const r = row.original;
              const checked = selectedIds.has(r.id);
              return (
                <tr
                  key={row.id}
                  className="border-t border-[color:var(--sarir-border)] transition hover:bg-white/5"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <td className="px-4 py-2">
                    <button className="chip" onClick={() => toggleOne(r.id)}>
                      {checked ? "✓" : "□"}
                    </button>
                  </td>
                  {row.getVisibleCells().map((cell) => {
                    const cellValue = cell.getValue<any>();
                    return (
                      <td
                        key={cell.id}
                        className={`px-4 ${density === "dense" ? "py-2" : density === "compact" ? "py-1" : "py-3"}`}
                      >
                        {typeof cellValue === "string" || typeof cellValue === "number"
                          ? String(cellValue)
                          : (cellValue as React.ReactNode)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} colSpan={table.getAllColumns().length + 1} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
