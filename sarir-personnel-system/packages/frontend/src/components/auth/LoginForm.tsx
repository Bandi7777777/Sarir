"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAccessToken } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/config";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
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
        const msg = data?.detail || "خطا در ورود. لطفا دوباره تلاش کنید.";
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

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3 text-right">
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <div className="space-y-4 max-w-xs mx-auto">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-right" htmlFor="username">
            نام کاربری
          </label>
          <Input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="نام کاربری"
            className="text-right"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-right" htmlFor="password">
            کلمه عبور
          </label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="کلمه عبور"
            className="text-right"
          />
        </div>
      </div>

      <div className="text-xs text-left text-[#4DA8FF] hover:text-[#66B2FF] transition-colors duration-200 max-w-[224px] mx-auto">
        <a href="#">فراموشی کلمه عبور</a>
      </div>

      <div className="max-w-[224px] mx-auto">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "در حال ورود..." : "ورود"}
        </Button>
      </div>
    </form>
  );
}
