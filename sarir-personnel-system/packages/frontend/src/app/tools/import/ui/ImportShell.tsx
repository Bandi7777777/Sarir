"use client";

import type { ReactNode } from "react";

import styles from "../import.module.css";

export function ImportShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className={styles.shell}>
      <div className={styles.panel}>{children}</div>
    </div>
  );
}
