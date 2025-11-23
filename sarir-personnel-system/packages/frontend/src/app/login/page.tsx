"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";

import { FormPageLayout } from "@/components/layouts/FormPageLayout";

const LoginForm = dynamic(() => import("@/components/auth/LoginForm"), {
  ssr: false,
});

export default function LoginPage() {
  return (
    <div className="login-page min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#E0F4FA] to-[#F9FDFF] animate-gradient-bg relative overflow-hidden">
      <div className="relative w-full max-w-[864px] h-[486px] rounded-3xl overflow-hidden bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-2xl border border-white/30 z-10 shadow-xl animate-glow-border">
        <FormPageLayout
          title="ورود به سامانه"
          description="برای ادامه، نام کاربری و رمز عبور خود را وارد کنید."
          widthClassName="max-w-full"
        >
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/2 flex justify-center items-center p-4 md:p-4 text-right bg-transparent">
              <div className="flex flex-col items-center text-center space-y-2 w-full px-4 animate-slide-up">
                <Image
                  src="/images/logo-sarir.png"
                  alt="Sarir Logo"
                  width={350}
                  height={130}
                  className="mx-auto drop-shadow-2xl animate-glow-logo"
                  style={{
                    filter: "drop-shadow(0 0 24px rgba(0, 123, 255, 0.35))",
                  }}
                  priority
                />
                <div className="w-full" style={{ transform: "translateY(-38px)" }}>
                  <LoginForm />
                </div>
              </div>
            </div>

            <div
              className="relative w-full md:w-1/2 flex justify-center items-center p-4 md:p-6 bg-transparent text-white overflow-hidden"
              style={{
                clipPath: "url(#ellipse-clip)",
                filter: "drop-shadow(0 0 18px rgba(0, 123, 255, 0.35))",
              }}
            >
              <svg className="absolute inset-0 w-0 h-0">
                <defs>
                  <clipPath id="ellipse-clip" clipPathUnits="objectBoundingBox">
                    <path d="M0,0 H1 C0.85,0.3 0.85,0.7 1,1 H0 V0 Z" />
                  </clipPath>
                </defs>
              </svg>

              <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-br from-[#1A4A6A] to-[#0D3A4F]" />
              <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-t from-[#047A9A] to-[#2A7A9A]" />

              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-2 h-2 bg-[#4DA8FF] rounded-full opacity-30 animate-particle-1" />
                <div className="absolute w-3 h-3 bg-[#66B2FF] rounded-full opacity-20 animate-particle-2" />
                <div className="absolute w-1 h-1 bg-[#81D4FA] rounded-full opacity-40 animate-particle-3" />
              </div>

              <div className="relative z-20 text-center flex flex-col items-center justify-between gap-3 animate-slide-right mt-[-120px]">
                <div className="mb-12 animate-sarir-drift translate-y-[132px]">
                  <span
                    className="text-[36px] md:text-[64px] font-extrabold bg-gradient-to-r from-[#66C2FF] to-[#99DBFF] bg-clip-text text-transparent tracking-[.08em]"
                    style={{
                      textShadow:
                        "0 0 14px rgba(77,168,255,0.6), 0 0 32px rgba(77,168,255,0.4)",
                      filter:
                        "drop-shadow(0 0 22px rgba(77,168,255,0.35)) drop-shadow(0 0 36px rgba(77,168,255,0.25))",
                    }}
                  >
                    SARIR <span className="relative md:left-4">LOGISTIC</span>
                  </span>
                </div>

                <h1 className="text-[14px] md:text-[18px] font-extrabold leading-relaxed drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] animate-text-reveal bg-gradient-to-r from-[#B3E5FC] to-[#E0F4FA] bg-clip-text text-transparent translate-y-[172px]">
                  در مسیر موفقیت همراهتان هستیم
                  <br />
                  به سامانه خوش آمدید!
                </h1>

                <div className="relative w-fit mx-auto mb-[-61px] -translate-y-[80px]">
                  <Image
                    src="/images/truck.png"
                    alt="truck"
                    width={220}
                    height={82}
                    style={{ transform: "scale(2.25)" }}
                    className="drop-shadow-[0_16px_28px_rgba(0,0,0,0.45)] animate-truck-combo"
                    priority
                  />
                  <div className="absolute bottom-[4px] left-1/2 transform -translate-x-[70px] w-[30px] h-[10px] bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-full opacity-60 blur-sm" />
                  <div className="absolute bottom-[4px] left-1/2 transform translate-x-[40px] w-[30px] h-[10px] bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-full opacity-60 blur-sm" />
                </div>

                <p className="text-[14px] md:text-[16px] font-medium tracking-widest opacity-95 drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] animate-text-reveal bg-gradient-to-r from-[#C7ECFF] to-[#E6FAFF] bg-clip-text text-transparent font-['Vazirmatn'] mt-[82px]">
                  A NEW TRACK OF SUCCESS
                </p>
              </div>
            </div>
          </div>
        </FormPageLayout>
      </div>

      <style jsx global>{`
        .animate-gradient-bg {
          background-size: 180% 180%;
          animation: gradient-pan 24s ease infinite;
        }
        @keyframes gradient-pan {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }

        .animate-glow-border {
          box-shadow: 0 20px 80px -20px rgba(7, 101, 126, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.25) inset;
        }

        .animate-glow-logo {
          animation: logo-glow 6s ease-in-out infinite;
        }
        @keyframes logo-glow {
          0%,
          100% {
            filter: drop-shadow(0 0 24px rgba(0, 123, 255, 0.35));
          }
          50% {
            filter: drop-shadow(0 0 36px rgba(0, 123, 255, 0.45));
          }
        }

        .animate-sarir-drift {
          animation: sarir-drift 9s ease-in-out infinite;
        }
        @keyframes sarir-drift {
          0% {
            transform: translateX(-10px);
          }
          50% {
            transform: translateX(14px);
          }
          100% {
            transform: translateX(-10px);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-right {
          animation: slide-right 0.9s ease-out;
        }
        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(-24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-text-reveal {
          animation: text-reveal 1s ease-in-out forwards;
        }
        @keyframes text-reveal {
          0% {
            opacity: 0;
            letter-spacing: 0.25em;
          }
          100% {
            opacity: 1;
            letter-spacing: 0.12em;
          }
        }

        .animate-truck-combo {
          animation: truck-bounce 8s ease-in-out infinite;
        }
        @keyframes truck-bounce {
          0% {
            transform: translateY(0) scale(2.25);
          }
          50% {
            transform: translateY(-8px) scale(2.25);
          }
          100% {
            transform: translateY(0) scale(2.25);
          }
        }

        .animate-glow-border {
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
