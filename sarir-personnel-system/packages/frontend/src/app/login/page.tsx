"use client";

import { AlertCircle, Lock, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { saveAccessToken } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/config";

import LoginLayout from "./ui/LoginLayout";
import { LoginButton } from "./ui/LoginButton";
import { LoginFormCard } from "./ui/LoginFormCard";
import { LoginFormPanel } from "./ui/LoginFormPanel";
import { LoginHero } from "./ui/LoginHero";
import { LoginInput } from "./ui/LoginInput";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
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
        const data = await res.json();
        const msg = data?.detail || "ورود ناموفق بود. لطفا اطلاعات خود را بررسی کنید.";
        throw new Error(msg);
      }
      const data = await res.json();
      const { access_token } = data;
      if (access_token) {
        saveAccessToken(access_token);
      }
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "خطا در ورود.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const focusForm = () => {
    usernameRef.current?.focus();
    usernameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <LoginLayout
      hero={<LoginHero onCtaClick={focusForm} />}
      form={
        <LoginFormPanel>
          <LoginFormCard id="login-form">
            <div className={styles.logoRow}>
              <div className={styles.logoCopy}>
                <div className={styles.logoText}>SARIR LOGISTIC</div>
                <div className={styles.logoSub}>سریر لجستیک هوشمند ایرانیان</div>
              </div>
              <div className={styles.logoCircle}>S</div>
            </div>

            <div className={styles.headingBlock}>
              <h2 className={styles.formTitle}>ورود به سامانه</h2>
              <p className={styles.formSubtitle}>برای ادامه، نام کاربری و کلمه عبور خود را وارد کنید.</p>
            </div>

            {error ? (
              <div className={styles.errorBox} role="alert">
                <AlertCircle className={styles.errorIcon} aria-hidden />
                <span>{error}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className={styles.formFields}>
              <label className={styles.field} htmlFor="username">
                <span className={styles.fieldLabel}>نام کاربری</span>
                <LoginInput
                  ref={usernameRef}
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری خود را وارد کنید"
                  icon={<User className={styles.inputGlyph} />}
                />
              </label>

              <label className={styles.field} htmlFor="password">
                <span className={styles.fieldLabel}>کلمه عبور</span>
                <LoginInput
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="کلمه عبور را وارد کنید"
                  icon={<Lock className={styles.inputGlyph} />}
                />
              </label>

              <LoginButton type="submit" disabled={loading} aria-busy={loading}>
                <span className={styles.buttonContent}>
                  {loading ? <span className={styles.spinner} aria-hidden /> : <Lock className={styles.buttonIcon} />}
                  {loading ? "در حال ورود..." : "ورود"}
                </span>
              </LoginButton>
            </form>

            <div className={styles.helperRow}>
              <a href="#" className={styles.recoverLink}>
                بازیابی رمز عبور
              </a>
              <span className={styles.supportText}>
                <Phone className={styles.supportIcon} />
                پشتیبانی: -
              </span>
            </div>
          </LoginFormCard>
        </LoginFormPanel>
      }
    />
  );
}
