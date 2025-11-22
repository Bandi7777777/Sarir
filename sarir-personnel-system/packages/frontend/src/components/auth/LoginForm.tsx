"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/config";
import { saveAccessToken } from "@/lib/auth";

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
    } catch (err: any) {
      setError(err.message || "خطا در ورود.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3 text-right">
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <div className="relative max-w-[224px] mx-auto">
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4DA8FF]/60 text-sm placeholder-center bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 text-gray-800 placeholder-gray-400"
          placeholder="نام کاربری"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          👤
        </span>
      </div>

      <div className="relative max-w-[224px] mx-auto">
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4DA8FF]/60 text-sm placeholder-center bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 text-gray-800 placeholder-gray-400"
          placeholder="کلمه عبور"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          🔒
        </span>
      </div>

      <div className="text-xs text-left text-[#4DA8FF] hover:text-[#66B2FF] transition-colors duration-200 max-w-[224px] mx-auto">
        <a href="#">فراموشی کلمه عبور</a>
      </div>

      <div className="max-w-[224px] mx-auto">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-light transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg"
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </div>
    </form>
  );
}
