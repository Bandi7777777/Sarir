"use client";

import type { ReactNode } from "react";

import styles from "../login.module.css";

type Props = {
  children: ReactNode;
};

export function LoginFormPanel({ children }: Props) {
  return (
    <div className={styles.formColumn}>
      <div className={styles.formPanel}>{children}</div>
    </div>
  );
}
