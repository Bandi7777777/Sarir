"use client";

import type { ReactNode } from "react";

import styles from "../login.module.css";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function LoginFormCard({ children, className, id }: Props) {
  const classes = [styles.formCardWrap, className].filter(Boolean).join(" ");

  return (
    <div className={classes} id={id}>
      <div className={styles.formCard}>{children}</div>
    </div>
  );
}
