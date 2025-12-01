"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { Lock, User2 } from "lucide-react";

import styles from "./LoginFrozen.module.css";

type GhostWord = {
  top: number;
  left: number;
  size: number;
  rotate: number;
  opacity: number;
};

type AccentDot = {
  top: number;
  left: number;
  size: number;
  opacity: number;
};

type OrbitRing = {
  size: number;
  top: string;
  left: string;
  rotate?: number;
};

const orbitRings: OrbitRing[] = [
  { size: 980, top: "-22%", left: "-8%", rotate: -8 },
  { size: 780, top: "10%", left: "42%", rotate: 6 },
  { size: 620, top: "50%", left: "-4%", rotate: -14 },
  { size: 890, top: "58%", left: "50%", rotate: 10 },
  { size: 520, top: "82%", left: "16%", rotate: -6 },
];

const ghostWords: GhostWord[] = Array.from({ length: 58 }, (_, index) => {
  const seed = index + 1;
  const waveX = Math.sin(seed * 1.37) * 42;
  const waveY = Math.cos(seed * 1.61) * 46;
  const baseX = 50 + waveX - (seed % 5) * 3;
  const baseY = 50 + waveY + ((seed % 7) - 3) * 2.2;
  const size = 110 + ((seed * 37) % 150);
  const rotate = ((seed * 9) % 24) - 12;
  const opacity = 0.03 + (seed % 7) * 0.004;

  return {
    top: baseY,
    left: baseX,
    size,
    rotate,
    opacity,
  };
});

const accentDots: AccentDot[] = Array.from({ length: 68 }, (_, index) => {
  const seed = index + 5;
  const left = ((Math.sin(seed * 2.17) + 1) / 2) * 100;
  const top = ((Math.cos(seed * 1.83) + 1) / 2) * 100;
  const size = 3 + (seed % 4);
  const opacity = 0.4 + ((seed % 5) * 0.08);

  return { top, left, size, opacity };
});

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
    <main className={styles.screen} data-page="login" dir="rtl">
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.backgroundGradient} />
        <div className={styles.backgroundSheen} />
        <div className={styles.rightLight} />
        {orbitRings.map((orbit, index) => (
          <div
            key={`orbit-${index}`}
            className={styles.orbit}
            style={{
              width: orbit.size,
              height: orbit.size,
              top: orbit.top,
              left: orbit.left,
              transform: `translate(-50%, -50%) rotate(${orbit.rotate ?? 0}deg)`,
            }}
          />
        ))}

        {ghostWords.map((ghost, index) => (
          <span
            key={`ghost-${index}`}
            className={styles.ghostWord}
            style={{
              top: `${ghost.top}%`,
              left: `${ghost.left}%`,
              fontSize: `${ghost.size}px`,
              transform: `translate(-50%, -50%) rotate(${ghost.rotate}deg)`,
              opacity: ghost.opacity,
            }}
          >
            SARIR
          </span>
        ))}

        {accentDots.map((dot, index) => (
          <span
            key={`dot-${index}`}
            className={styles.accentDot}
            style={{
              top: `${dot.top}%`,
              left: `${dot.left}%`,
              width: dot.size,
              height: dot.size,
              opacity: dot.opacity,
            }}
          />
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.layout}>
          <section className={styles.heroSection}>
            <div className={styles.heroCopy}>
              <div className={styles.heroChip}>
                <span className={styles.heroChipBar} />
                <span className={styles.heroChipText}>مسیرهای امن، تحویل‌های سریع</span>
              </div>
              <h1 className={styles.heroTitle}>هوشمند پرسنل شروع کن</h1>
              <p className={styles.heroSubtitle}>
                سامانه یکپارچه سریر، دسترسی شما به پرسنل، مأموریت‌ها و گزارش‌ها را در لحظه فراهم می‌کند.
              </p>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.truckPlate}>
                <div className={styles.truckGlow} />
                <div className={styles.truckShadow} />
                <Image
                  src="/images/sarir-truck-login.png"
                  alt="کامیون سریر"
                  width={680}
                  height={360}
                  priority
                  className={styles.truckImage}
                />
              </div>
              <p className={styles.heroSlogan}>A NEW TRACK OF SUCCESS</p>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.glassCard}>
              <div className={styles.cardHighlight} aria-hidden="true" />
              <div className={styles.cardHeader}>
                <div className={styles.logoBadge}>
                  <Image src="/logo-sarir.svg" alt="لوگو سریر" width={48} height={48} />
                </div>
                <div className={styles.brandStack}>
                  <span className={styles.brandTitle}>Sarir Logistic</span>
                  <span className={styles.brandSubtitle}>سریر لجستیک هوشمند ایرانیان (سهامی خاص)</span>
                </div>
              </div>

              <div className={styles.cardIntro}>
                <h2>ورود به سامانه پرسنل</h2>
                <p>نام کاربری و کلمه عبور خود را وارد کنید تا وارد داشبورد شوید.</p>
              </div>

              <form className={styles.form} dir="rtl" onSubmit={handleSubmit}>
                <label className={styles.fieldLabel} htmlFor="username">
                  نام کاربری
                </label>
                <div className={styles.inputShell}>
                  <User2 className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="مثلاً user@sarir.ir"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                  />
                </div>

                <label className={styles.fieldLabel} htmlFor="password">
                  کلمه عبور
                </label>
                <div className={styles.inputShell}>
                  <Lock className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <div className={styles.formMeta}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.checkbox} />
                    <span>مرا به خاطر بسپار</span>
                  </label>
                  <a className={styles.forgotLink} href="#">
                    فراموشی رمز عبور
                  </a>
                </div>

                <button className={styles.submitButton} type="submit" disabled={submitting}>
                  <span className={styles.submitSheen} aria-hidden="true" />
                  {submitting ? "در حال پردازش..." : "ورود"}
                </button>

                <p className={styles.formFooter}>
                  استفاده از این سامانه صرفاً برای کاربران مجاز سریر مجاز است.
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
