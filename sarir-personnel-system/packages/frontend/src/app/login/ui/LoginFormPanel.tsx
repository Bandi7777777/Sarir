"use client";

import type { ReactNode } from "react";

import styles from "../login.module.css";

type Props = {
  children: ReactNode;
};

export function LoginFormPanel({ children }: Props) {
  return (
    <div className={styles.formPanelOuter}>
      <div className={styles.formPanelInner}>{children}</div>
    </div>
  );
}
