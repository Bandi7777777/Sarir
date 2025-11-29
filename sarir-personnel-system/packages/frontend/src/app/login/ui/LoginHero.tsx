"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";

import styles from "../login.module.css";

type Props = {
  onCtaClick?: () => void;
};

export function LoginHero({ onCtaClick }: Props) {
  return (
    <div className={styles.heroColumn}>
      <div className={styles.heroArc} />
      <div className={styles.heroOverlay} />
      <div className={styles.heroLights} />

      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <p className={styles.heroTag}>SARIR LOGISTIC</p>
          <h1 className={styles.heroTitle}>
            سامانه هوشمند پرسنل
            <br />
            سریر لجستیک
          </h1>
          <p className={styles.heroSubtitle}>
            یک ورود امن و سریع برای مدیریت منابع انسانی، ناوگان و هیئتمدیره در یک پنل هوشمند.
          </p>
          <button type="button" className={styles.heroCta} onClick={onCtaClick}>
            <span>شروع کن</span>
            <ArrowLeft className={styles.heroCtaIcon} />
          </button>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.loginTruck}>
            <Image
              src="/images/truck.png"
              alt="Sarir Logistic truck"
              width={420}
              height={220}
              className={styles.truckImage}
              priority
            />
          </div>
          <div className={styles.roadWrap}>
            <div className={styles.roadBase} />
            <div className={styles.roadStripe} />
          </div>
          <p className={styles.tagline}>A NEW TRACK OF SUCCESS</p>
        </div>
      </div>
    </div>
  );
}
