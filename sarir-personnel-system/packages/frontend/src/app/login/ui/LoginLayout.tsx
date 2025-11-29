"use client";

import type { ReactNode } from "react";

import styles from "../login.module.css";

type Props = {
  hero: ReactNode;
  form: ReactNode;
};

export default function LoginLayout({ hero, form }: Props) {
  return (
    <main className={styles.page} dir="rtl">
      <section className={styles.cardSection}>
        <div className={styles.cardShell}>
          <div className={styles.cardGrid}>
            {form}
            {hero}
          </div>
        </div>
      </section>
    </main>
  );
}
