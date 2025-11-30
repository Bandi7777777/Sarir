"use client";

/**
 * LOGIN PAGE - SARIR LOGISTIC
 * Frozen UI version dedicated to /login.
 * This page has its own layout and CSS module. Do NOT reuse these classes elsewhere.
 */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { FrozenButton } from "@/components/frozen/FrozenButton";
import { FrozenCard } from "@/components/frozen/FrozenCard";
import { FrozenInput } from "@/components/frozen/FrozenInput";
import { saveAccessToken } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/config";

import styles from "./LoginFrozen.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        let message = "ورود ناموفق بود. لطفا دوباره تلاش کنید.";
        try {
          const data = await res.json();
          if (data?.detail) message = data.detail;
        } catch {
          // ignore JSON parse error
        }
        throw new Error(message);
      }

      const data = await res.json();
      const accessToken = data?.access_token as string | undefined;
      if (accessToken) {
        saveAccessToken(accessToken);
      }

      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "خطایی رخ داد. لطفا دوباره امتحان کنید.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const focusUsername = () => {
    const el = document.getElementById("username");
    if (el instanceof HTMLInputElement) {
      el.focus();
    }
  };

  return (
    <main data-page="login" dir="rtl" className={styles.screen}>
      <div className={styles.shell}>
        <div className={styles.formBg} aria-hidden="true" />
        <div className={styles.twoColumn}>
          {/* بخش هیرو و کامیون - ستون چپ */}
          <section className={`${styles.hero} ${styles.heroColumn}`}>
            <div className={styles.heroTop}>
              <div className={styles.heroBadgeRow}>
                <span className={styles.heroBadge}>SARIR LOGISTIC</span>
              </div>

              <div className={styles.heroHeading}>
                <h1>
                  سامانه هوشمند پرسنل
                  <br />
                  سرير لجستیک
                </h1>
                <p>
                  یک ورود امن و سریع برای مدیریت منابع انسانی ناوگان و هیئتمدیره در یک پنل
                  هوشمند.
                </p>
              </div>

              <button
                type="button"
                className={styles.heroCta}
                onClick={focusUsername}
              >
                <span></span>
                <span>شروع کن</span>
              </button>
            </div>

            <div className={styles.heroBottom}>
              <div className={styles.truckScene}>
                <div className={styles.truckImageWrap}>
                  <Image
                    src="/images/truck.png"
                    alt="کامیون لجستیک سرير"
                    width={520}
                    height={300}
                    className={styles.truckImage}
                    priority
                  />
                </div>
                <div className={styles.truckRoad} aria-hidden="true" />
              </div>
              <p className={styles.heroTagline}>A NEW TRACK OF SUCCESS</p>
            </div>
          </section>

          {/* بخش ورود - ستون راست */}
          <section className={`${styles.formSide} ${styles.formColumn}`}>
            <FrozenCard className={styles.formCard}>
              <header className={styles.formHeader}>
                <div className={styles.formLogoBadge}>S</div>
                <div>
                  <p className={styles.formLogoTitle}>SARIR LOGISTIC</p>
                  <p className={styles.formLogoSubtitle}>
                    سرير لجستیک هوشمند ایرانیان
                  </p>
                </div>
              </header>

              <div className={styles.formCopy}>
                <h2>ورود به سامانه</h2>
                <p>برای ادامه نام کاربری و کلمه عبور خود را وارد کنید.</p>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}

              <form onSubmit={handleSubmit} className={styles.formFields}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="username" className={styles.fieldLabel}>
                    نام کاربری
                  </label>
                  <FrozenInput
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="نام کاربری خود را وارد کنید"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="password" className={styles.fieldLabel}>
                    کلمه عبور
                  </label>
                  <FrozenInput
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="کلمه عبور را وارد کنید"
                  />
                </div>

                <div className={styles.supportRow}>
                  <a href="#" className={styles.supportLink}>
                    بازیابی رمز عبور
                  </a>
                  <span>ورود امن به پنل مدیر</span>
                </div>

                <FrozenButton
                  type="submit"
                  disabled={loading}
                  className={styles.submitButton}
                >
                  {loading ? "در حال ورود..." : "ورود"}
                </FrozenButton>
              </form>

              <div className={styles.formFooter}>
                <span>پشتیبانی: --XXX</span>
                <span>سامانه هوشمند پرسنل سرير</span>
              </div>
            </FrozenCard>
          </section>
        </div>
      </div>
    </main>
  );
}
