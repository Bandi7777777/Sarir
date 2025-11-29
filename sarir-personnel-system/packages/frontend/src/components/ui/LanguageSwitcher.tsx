"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { ChangeEvent } from "react";

// TODO: اگر i18n داخلی دارید، از آن import کنید:
// import { locales as availableLocales } from "@/i18n/i18n";
const availableLocales = ["fa", "en", "ar"] as const;
type Locale = (typeof availableLocales)[number];

const isLocale = (value: string): value is Locale => availableLocales.includes(value as Locale);

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    const base = pathname || "/";
    // جایگزینی پیشوند locale در مسیر
    const parts = base.split("/").filter(Boolean);
    if (parts[0] && isLocale(parts[0])) parts.shift();
    const newPath = `/${newLocale}/${parts.join("/")}`;
    router.push(newPath);
  };

  return (
    <div className="inline-flex items-center gap-2 card px-2 py-1">
      <span className="text-xs opacity-70">زبان</span>
      <select
        value={locale}
        onChange={handleChange}
        className="rounded-lg bg-white/10 text-white text-xs px-2 py-1 outline-none ring-1 ring-white/15 focus:ring-[rgba(7,101,126,.45)]"
      >
        {availableLocales.map((lang) => (
          <option key={lang} value={lang} className="text-gray-800">
            {lang === "fa" ? "فارسی" : lang === "en" ? "English" : "العربية"}
          </option>
        ))}
      </select>
    </div>
  );
}
