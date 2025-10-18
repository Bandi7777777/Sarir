// src/components/auth/LoginForm.tsx
"use client";
import { useState } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ورود با:", username, password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-3 text-right animate-fade-in-up"
    >
      <div className="relative max-w-[224px] mx-auto">
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4DA8FF]/60 text-sm placeholder-center bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 text-gray-800 placeholder-gray-400"
          placeholder="نام کاربری"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          🔒
        </span>
      </div>

      <div className="text-xs text-left text-[#4DA8FF] hover:text-[#66B2FF] transition-colors duration-200 max-w-[224px] mx-auto">
        <a href="#">فراموشی رمز عبور؟</a>
      </div>

      <div className="max-w-[224px] mx-auto">
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-light transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg hover:drop-shadow-[0_0_10px_rgba(77,168,255,0.5)]"
        >
          ورود
        </button>
      </div>
    </form>
  );
}



