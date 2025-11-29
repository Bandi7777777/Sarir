"use client";

import React, { type ButtonHTMLAttributes } from "react";

import styles from "./LoginButton.module.css";

interface LoginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function LoginButton({ loading, children, ...rest }: LoginButtonProps) {
  return (
    <button className={styles.button} {...rest} disabled={loading || rest.disabled}>
      {loading ? "در حال ورود..." : children}
    </button>
  );
}
