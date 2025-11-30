"use client";

/**
 * LOGIN PAGE - SARIR LOGISTIC
 * Frozen UI version dedicated to /login.
 * This page has its own layout and CSS module. Do NOT reuse these classes elsewhere.
 */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Lock, User2 } from "lucide-react";

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
        <div className={styles.twoColumn}>
          <section className={`${styles.hero} ${styles.heroColumn}`}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadgeRow}>
                <span className={styles.heroBadge}>SARIR LOGISTIC</span>
              </div>

              <div className={styles.heroHeading}>
                <p className={styles.heroKicker}>ورود امن به پنل مدیر</p>
                <h1>
                  سامانه هوشمند مدیریت پرسنل
                  <br />
                  و ناوگان سرير لجستیک
                </h1>
                <p>
                  همه‌ی تیم منابع انسانی، رانندگان و هیئت‌مدیره در یک داشبورد یکپارچه. داده‌ها
                  همیشه در دسترس شما هستند.
                </p>
              </div>

              <button
                type="button"
                className={styles.heroCta}
                onClick={focusUsername}
              >
                <span className={styles.heroCtaDot} />
                <span>شروع کن</span>
              </button>
            </div>

            <div className={styles.heroVisual}>
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

          <section className={`${styles.formSide} ${styles.formColumn}`}>
            <div className={styles.formBg} aria-hidden="true" />
            <FrozenCard className={styles.formCard}>
              <header className={styles.formHeader}>
                <Image
                  src="/images/logo-square.svg"
                  alt="لوگوی سرير"
                  width={48}
                  height={48}
                  className={styles.logoSquare}
                />
                <div className={styles.formBrandText}>
                  <p className={styles.formLogoTitle}>SARIR LOGISTIC</p>
                  <p className={styles.formLogoSubtitle}>سامانه هوشمند پرسنل سرير</p>
                </div>
              </header>

              <div className={styles.formCopy}>
                <h2>خوش آمدید</h2>
                <p>برای ورود، نام کاربری و کلمه عبور خود را وارد کنید.</p>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}

              <form onSubmit={handleSubmit} className={styles.formFields}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="username" className={styles.fieldLabel}>
                    نام کاربری
                  </label>
                  <div className={styles.inputWrapper}>
                    <User2 className={styles.inputIcon} aria-hidden="true" />
                    <FrozenInput
                      id="username"
                      type="text"
                      required
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="نام کاربری خود را وارد کنید"
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="password" className={styles.fieldLabel}>
                    کلمه عبور
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} aria-hidden="true" />
                    <FrozenInput
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="کلمه عبور را وارد کنید"
                      className={styles.inputField}
                    />
                  </div>
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
