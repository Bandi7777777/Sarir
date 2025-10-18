// src/app/login/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#E0F4FA] to-[#F9FDFF] animate-gradient-bg">
      <div className="relative w-full max-w-[864px] h-[486px] rounded-3xl overflow-hidden bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-2xl border border-white/30 z-10 shadow-xl animate-glow-border">
        <div className="flex flex-col md:flex-row h-full">
          {/* White Section – Logo and Form */}
          <div className="w-full md:w-1/2 flex justify-center items-center p-4 md:p-4 text-right bg-transparent">
            <div className="flex flex-col items-center text-center space-y-2 w-full px-4 animate-slide-up">
              <Image
                src="/images/logo-sarir.png"
                alt="Sarir Logo"
                width={350}
                height={130}
                className="mx-auto drop-shadow-2xl animate-glow-logo"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(0, 123, 255, 0.3))",
                }}
                priority
              />
              <div
                className="w-full"
                style={{ transform: "translateY(-38px)" }}
              >
                <LoginForm />
              </div>
            </div>
          </div>

          {/* Darker Section – truck and Slogan with clipPath */}
          <div
            className="relative w-full md:w-1/2 flex justify-center items-center p-4 md:p-6 bg-transparent text-white overflow-hidden"
            style={{
              clipPath: "url(#ellipse-clip)",
              filter: "drop-shadow(0 0 15px rgba(0, 123, 255, 0.3))",
            }}
          >
            <svg className="absolute inset-0 w-0 h-0">
              <defs>
                <clipPath id="ellipse-clip" clipPathUnits="objectBoundingBox">
                  <path d="M0,0 H1 C0.85,0.3 0.85,0.7 1,1 H0 V0 Z" />
                </clipPath>
              </defs>
            </svg>

            {/* Darker Lower Section */}
            <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-br from-[#1A4A6A] to-[#0D3A4F]"></div>

            {/* Lighter Upper Section */}
            <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-t from-[#047A9A] to-[#2A7A9A]"></div>

            {/* Animated Particles Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-2 h-2 bg-[#4DA8FF] rounded-full opacity-30 animate-particle-1"></div>
              <div className="absolute w-3 h-3 bg-[#66B2FF] rounded-full opacity-20 animate-particle-2"></div>
              <div className="absolute w-1 h-1 bg-[#81D4FA] rounded-full opacity-40 animate-particle-3"></div>
            </div>

            {/* Faded Background Text with Neon Effect */}
            <div className="absolute inset-0 opacity-30 text-[54px] md:text-[86px] font-extrabold flex items-center justify-center select-none leading-none animate-neon-text pr-[100px]">
              <span className="bg-gradient-to-r from-[#4DA8FF] to-[#66B2FF] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(77,168,255,0.4)]">
                SARIR <span className="relative left-[76px]">LOGISTIC</span>
              </span>
            </div>

            {/* Truck + Slogan */}
            <div className="relative z-20 text-center flex flex-col items-center justify-between gap-2 animate-slide-right">
              <h1
                className="text-[14px] md:text-[18px] font-extrabold leading-relaxed drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] animate-text-reveal bg-gradient-to-r from-[#B3E5FC] to-[#E0F4FA] bg-clip-text text-transparent"
                style={{ transform: "translateY(-152px)" }}
              >
                به سامانه هوشمند مدیریت پرسنل
                <br />
                سریر لجستیک خوش آمدید!
              </h1>

              <div className="relative w-fit mx-auto mb-[-61px]">
                <Image
                  src="/images/truck.png"
                  alt="truck"
                  width={220}
                  height={82}
                  style={{ transform: "scale(2.25)" }}
                  className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] animate-truck-move"
                />
                <div className="absolute bottom-[4px] left-1/2 transform -translate-x-[70px] w-[30px] h-[10px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full opacity-50 blur-sm"></div>
                <div className="absolute bottom-[4px] left-1/2 transform translate-x-[40px] w-[30px] h-[10px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full opacity-50 blur-sm"></div>
              </div>

              <p className="text-[14px] md:text-[16px] font-medium tracking-widest opacity-90 drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] animate-text-reveal bg-gradient-to-r from-[#B3E5FC] to-[#E0F4FA] bg-clip-text text-transparent text-shadow-[0_0_10px_rgba(255,255,255,0.5)] font-['Vazirmatn'] mt-[132px]">
                A NEW TRACK OF SUCCESS
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}






