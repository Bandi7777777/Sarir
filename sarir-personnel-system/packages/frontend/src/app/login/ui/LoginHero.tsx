"use client";

import styles from "./LoginHero.module.css";
import { TruckScene } from "./TruckScene";

type Props = {
  onStartClick?: () => void;
};

export function LoginHero({ onStartClick }: Props) {
  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <span className={styles.brandEn}>SARIR LOGISTIC</span>
          <span className={styles.brandFa}>سریر لجستیک هوشمند ایرانیان</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.copy}>
          <h1 className={styles.title}>
            <span>سامانه هوشمند پرسنل</span>
            <span>سریر لجستیک</span>
          </h1>
          <p className={styles.subtitle}>یک پنل هوشمند.</p>
          <button type="button" className={styles.cta} onClick={onStartClick}>
            شروع کن
          </button>
        </div>

        <TruckScene />
      </div>
    </section>
  );
}
