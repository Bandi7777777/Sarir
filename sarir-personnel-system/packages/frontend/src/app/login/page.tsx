"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => setSubmitting(false), 900);
    // TODO: Connect to backend authentication when ready.
  };

  return (
    <main className={styles.page} dir="rtl" data-page="login">
      {/* Background orbits + ghost SARIR text */}
      <div className={styles.bgLayer}>
        <div className={`${styles.orbit} ${styles.orbit1}`} />
        <div className={`${styles.orbit} ${styles.orbit2}`} />
        <div className={`${styles.orbit} ${styles.orbit3}`} />

        <span className={`${styles.bgWord} ${styles.bgWord1}`}>SARIR</span>
        <span className={`${styles.bgWord} ${styles.bgWord2}`}>SARIR</span>
        <span className={`${styles.bgWord} ${styles.bgWord3}`}>SARIR</span>
      </div>

      <div className={styles.inner}>
        {/* LEFT: hero text + truck */}
        <section className={styles.hero}>
          <div className={styles.heroHeader}>
            <h1 className={styles.heroTitle}>
              هوشمند پرسنل
              <br />
              را شروع کن
            </h1>

            <div className={styles.chip}>
              <span className={styles.chipDot} />
              <span className={styles.chipText}>#F89C2A</span>
            </div>

            <p className={styles.heroSubtitle}>
              سامانه یکپارچه سریر دسترسی شما به پرسنل مأموریت‌ها و گزارش‌ها را در لحظه فراهم
              می‌کند.
            </p>
          </div>

          <div className={styles.heroTruck}>
            <Image
              src="/images/sarir-truck-login.png"
              alt="Sarir Logistic Truck"
              fill
              className={styles.heroTruckImage}
              priority
              sizes="(max-width: 1024px) 80vw, 520px"
            />
          </div>

          <p className={styles.heroTagline}>A NEW TRACK OF SUCCESS</p>
        </section>

        {/* RIGHT: glassmorphism login card */}
        <section className={styles.loginPanel}>
          <div className={styles.loginCard}>
            <header className={styles.loginHeader}>
              <div className={styles.loginLogo}>
                <div className={styles.loginLogoIcon}>
                  <Image
                    src="/logo-sarir.png"
                    alt="Sarir Logistic"
                    fill
                    className={styles.logoImage}
                    sizes="44px"
                  />
                </div>
                <div className={styles.loginLogoText}>
                  <div className={styles.loginTitle}>Sarir Logistic</div>
                  <div className={styles.loginSubtitle}>
                    سریر لجستیک هوشمند ایرانیان (سهامی خاص)
                  </div>
                </div>
              </div>
            </header>

            <div className={styles.cardDivider} />

            <div className={styles.cardTitleBlock}>
              <h2 className={styles.cardTitle}>ورود به سامانه پرسنل</h2>
              <p className={styles.cardDescription}>
                نام کاربری و کلمه عبور خود را وارد کنید تا به سامانه دسترسی پیدا کنید.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              {/* Username */}
              <label className={styles.field}>
                <span className={styles.fieldLabel}>نام کاربری</span>
                <div className={styles.fieldInput}>
                  <input
                    type="text"
                    placeholder="مثلا user@sarir.ir"
                    className={styles.input}
                    name="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    required
                  />
                  <span className={styles.fieldIcon} aria-hidden="true">
                    👤
                  </span>
                </div>
              </label>

              {/* Password */}
              <label className={styles.field}>
                <span className={styles.fieldLabel}>کلمه عبور</span>
                <div className={styles.fieldInput}>
                  <input
                    type="password"
                    placeholder=""
                    className={styles.input}
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <span className={styles.fieldIcon} aria-hidden="true">
                    🔒
                  </span>
                </div>
              </label>

              <div className={styles.formRow}>
                <label className={styles.checkbox}>
                  <input type="checkbox" />
                  <span>مرا به خاطر بسپار</span>
                </label>

                <button type="button" className={styles.linkButton}>
                  فراموشی رمز عبور
                </button>
              </div>

              <button type="submit" className={styles.primaryButton} disabled={submitting}>
                {submitting ? "در حال پردازش..." : "ورود"}
              </button>

              <p className={styles.cardFooterText}>
                استفاده از این سامانه صرفا برای کاربران مجاز سریر مجاز است.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
