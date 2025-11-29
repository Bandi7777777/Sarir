"use client";

import type { ReactNode } from "react";

import styles from "../reports.module.css";

export function ReportsShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className={styles.shell}>
      <div className={styles.glow} />
      <div className={styles.container}>{children}</div>
    </div>
  );
}
