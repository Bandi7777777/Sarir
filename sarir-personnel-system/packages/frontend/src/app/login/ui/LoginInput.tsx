"use client";

import React, { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import styles from "./LoginInput.module.css";

interface LoginInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

export const LoginInput = forwardRef<HTMLInputElement, LoginInputProps>(function LoginInput(
  { label, icon, id, className, ...rest },
  ref
) {
  return (
    <label className={[styles.field, className].filter(Boolean).join(" ")} htmlFor={id}>
      <span className={styles.label}>{label}</span>
      <div className={styles.inputWrapper}>
        {icon ? <span className={styles.icon} aria-hidden>{icon}</span> : null}
        <input ref={ref} id={id} className={styles.input} {...rest} />
      </div>
    </label>
  );
});
