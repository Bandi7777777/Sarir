"use client";

type Props = { size?: number; className?: string };

export default function SarirLogo({ size = 40, className = "" }: Props) {
  // لوگوی تازه: قاب روشن + دو استروک مورّب با گرادیان (حس "مسیر/Track")
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="SARIR"
      className={className}
    >
      <defs>
        <linearGradient id="sarir-a" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="sarir-b" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="sarir-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0FAFF" />
          <stop offset="100%" stopColor="#E7F5FF" />
        </linearGradient>
      </defs>

      <rect x="6" y="6" width="52" height="52" rx="12" fill="url(#sarir-bg)" />
      <path d="M18 44 L40 18" stroke="url(#sarir-a)" strokeWidth="6" strokeLinecap="round" />
      <path d="M16 34 L30 18" stroke="url(#sarir-b)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
