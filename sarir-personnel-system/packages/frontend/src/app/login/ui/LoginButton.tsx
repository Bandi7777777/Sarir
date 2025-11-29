"use client";

import type { ButtonHTMLAttributes } from "react";

import styles from "../login.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function LoginButton({ className, ...rest }: Props) {
  return (
    <button {...rest} className={[styles.submitButton, className].filter(Boolean).join(" ")} />
  );
}
