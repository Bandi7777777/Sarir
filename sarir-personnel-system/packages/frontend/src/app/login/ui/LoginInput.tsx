"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import styles from "../login.module.css";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  rightSlot?: ReactNode;
};

export const LoginInput = forwardRef<HTMLInputElement, Props>(({ className = "", icon, rightSlot, ...rest }, ref) => {
  return (
    <div className={[styles.inputWrapper, className].filter(Boolean).join(" ")}>
      {icon ? <span className={styles.inputBadge}>{icon}</span> : null}
      <input ref={ref} {...rest} className={styles.inputField} />
      {rightSlot ? <span className={styles.inputRight}>{rightSlot}</span> : null}
    </div>
  );
});

LoginInput.displayName = "LoginInput";
