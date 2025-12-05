"use client";

import React from "react";
import Image from "next/image";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  // TODO: اینجا به لاجیک لاگین فعلی‌ات وصلش کن
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // مثلا: await login(username, password)
  };

  return (
    <main className={styles.page} dir="rtl">
      {/* بک‌گراند: اوربیت‌ها و SARIR محو */}
      <div className={styles.bgLayer}>
        <div className={`${styles.orbit} ${styles.orbit1}`} />
        <div className={`${styles.orbit} ${styles.orbit2}`} />
        <div className={`${styles.orbit} ${styles.orbit3}`} />

        <span className={`${styles.bgWord} ${styles.bgWord1}`}>SARIR</span>
        <span className={`${styles.bgWord} ${styles.bgWord2}`}>SARIR</span>
        <span className={`${styles.bgWord} ${styles.bgWord3}`}>SARIR</span>
      </div>

      <div className={styles.inner}>
        {/* ===== LEFT: تیتر + چیپ + کامیون ===== */}
        <section className={styles.hero}>
          <div className={styles.heroHeader}>
            {/* تیتر بالا – تو می‌تونی متن خودت رو جایگزین کنی */}
            <h1 className={styles.heroTitle}>ازموکوبود و نشانن</h1>

            {/* چیپ رنگ #F89C2A مثل طرح */}
            <button className={styles.chip} type="button">
              <span className={styles.chipText}>#F89C2A</span>
              <span className={styles.chipUnderline} />
            </button>
          </div>

          {/* کامیون پایینِ سمت چپ */}
          <div className={styles.heroTruckWrapper}>
            <div className={styles.heroTruck}>
              <Image
                src="/images/sarir-truck-login.png"
                alt="Sarir Logistic Truck"
                fill
                className={styles.heroTruckImage}
                priority
              />
            </div>
          </div>

          <p className={styles.heroTagline}>A NEW TRACK OF SUCCESS</p>
        </section>

        {/* ===== RIGHT: کارت لاگین گلس ===== */}
        <section className={styles.loginPanel}>
          <div className={styles.loginCard}>
            {/* لوگو بالا */}
            <header className={styles.loginHeader}>
              <div className={styles.loginLogo}>
                <div className={styles.loginLogoIcon}>
                  <Image
                    src="/logo-sarir.png"
                    alt="Sarir Logistic"
                    fill
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.loginLogoText}>
                  <div className={styles.loginTitle}>Sarir Logistic</div>
                  <div className={styles.loginSubtitle}>
                    (تاین ماروورد دواتاس شاوآت)
                  </div>
                </div>
              </div>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
              {/* فیلد شماره ۱ (hex + آیکن قفل سمت چپ و متن توضیح سمت راست) */}
              <label className={styles.field}>
                <div className={styles.fieldTopRow}>
                  <span className={styles.fieldLabel}>صرداافش</span>
                </div>
                <div className={styles.fieldInput}>
                  <span className={styles.fieldIconLeft} aria-hidden="true">
                    🔒
                  </span>
                  <input
                    type="text"
                    name="field1"
                    placeholder="#376D44"
                    className={styles.input}
                  />
                  <span className={styles.fieldIconRight} aria-hidden="true">
                    <span className={styles.dot} />
                  </span>
                </div>
              </label>

              {/* فیلد شماره ۲ */}
              <label className={styles.field}>
                <div className={styles.fieldTopRow}>
                  <span className={styles.fieldLabel}>ممواسبی</span>
                </div>
                <div className={styles.fieldInput}>
                  <span className={styles.fieldIconLeft} aria-hidden="true">
                    🔒
                  </span>
                  <input
                    type="password"
                    name="field2"
                    placeholder="#00517D"
                    className={styles.input}
                  />
                  <span className={styles.fieldIconRight} aria-hidden="true">
                    <span className={styles.dot} />
                  </span>
                </div>
              </label>

              {/* سه نقطه‌ی زیر فیلدها */}
              <div className={styles.dotsRow} aria-hidden="true">
                <span className={`${styles.pagerDot} ${styles.pagerDotActive}`} />
                <span className={styles.pagerDot} />
                <span className={styles.pagerDot} />
              </div>

              {/* دکمه‌ی گرادیانی مثل طرح */}
              <button type="submit" className={styles.primaryButton}>
                آزمونن
              </button>

              {/* لینک ترم‌ها پایین کارت */}
              <p className={styles.cardFooterText}>
                <a href="#" className={styles.footerLink}>
                  توضیحات / terms اپلیکیشن
                </a>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
