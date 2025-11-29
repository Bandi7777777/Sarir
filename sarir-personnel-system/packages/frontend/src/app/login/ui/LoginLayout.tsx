"use client";

import type { ReactNode } from "react";

import styles from "../login.module.css";

type Props = {
  hero: ReactNode;
  form: ReactNode;
};

export default function LoginLayout({ hero, form }: Props) {
  return (
    <main className={styles.loginRoot} dir="rtl" suppressHydrationWarning>
      <section className={styles.loginShell}>
        <div className={styles.heroSide}>{hero}</div>
        <div className={styles.formSide}>
          <div className={styles.formCurve} />
          {form}
        </div>
      </section>
    </main>
  );
}
