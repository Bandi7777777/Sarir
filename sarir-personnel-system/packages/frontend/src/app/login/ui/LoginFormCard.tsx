"use client";

import { AlertCircle, Lock, Phone, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type RefObject } from "react";

import { saveAccessToken } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/config";

import { LoginButton } from "./LoginButton";
import styles from "./LoginFormCard.module.css";
import { LoginInput } from "./LoginInput";

type Props = {
  usernameRef?: RefObject<HTMLInputElement>;
};

export function LoginFormCard({ usernameRef }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data?.detail || "نام کاربری یا کلمه عبور اشتباه است. لطفا دوباره تلاش کنید.";
        throw new Error(msg);
      }
      const data = await res.json();
      const { access_token } = data;
      if (access_token) {
        saveAccessToken(access_token);
      }
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "خطایی رخ داد.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <Image src="/images/logo-sarir-2.png" alt="لوگوی سریر" width={32} height={32} priority />
        </div>
        <div className={styles.brandBlock}>
          <span className={styles.brandEn}>SARIR LOGISTIC</span>
          <span className={styles.brandFa}>سریر لجستیک هوشمند ایرانیان</span>
        </div>
      </div>

      <div className={styles.titleBlock}>
        <h2 className={styles.title}>ورود به سامانه</h2>
        <p className={styles.helper}>برای ادامه، نام کاربری و کلمه عبور خود را وارد کنید.</p>
      </div>

      {error ? (
        <div className={styles.error} role="alert">
          <AlertCircle className={styles.errorIcon} aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit}>
        <LoginInput
          id="username"
          name="username"
          label="نام کاربری"
          placeholder="نام کاربری خود را وارد کنید"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          icon={<User size={16} aria-hidden />}
          ref={usernameRef}
        />

        <LoginInput
          id="password"
          name="password"
          type="password"
          label="کلمه عبور"
          placeholder="کلمه عبور را وارد کنید"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          icon={<Lock size={16} aria-hidden />}
        />

        <LoginButton type="submit" loading={loading} aria-busy={loading}>
          <span className={styles.buttonContent}>
            <Lock className={styles.buttonIcon} aria-hidden />
            <span>ورود</span>
          </span>
        </LoginButton>

        <div className={styles.footer}>
          <span className={styles.support}>
            <Phone size={16} aria-hidden />
            <span>پشتیبانی: 021-XXXXXXX</span>
          </span>
          <button type="button" className={styles.link}>
            بازیابی رمز عبور
          </button>
        </div>
      </form>
    </div>
  );
}
