import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Vazirmatn", ...fontFamily.sans],
      },
      colors: {
        sarir: {
          bg: "var(--color-shell-bg)",
          bgSoft: "var(--sarir-color-surface-soft)",
          surface: "var(--color-surface)",
          surfaceMuted: "var(--color-surface-muted)",
          surfaceGlass: "var(--color-surface-glass)",
          border: "var(--color-border-subtle)",
          primary: "var(--color-brand-primary)",
          primarySoft: "var(--color-brand-primary-soft)",
          accent: "var(--color-brand-accent)",
          text: "var(--color-text-main)",
          muted: "var(--color-text-muted)",
        },
        border: "var(--color-border-subtle)",
        input: "var(--input-border)",
        ring: "var(--color-brand-primary)",
        background: "var(--color-shell-bg)",
        foreground: "var(--color-text-main)",
        primary: {
          DEFAULT: "var(--color-brand-primary)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--color-surface-muted)",
          foreground: "var(--color-text-main)",
        },
        destructive: {
          DEFAULT: "var(--color-danger)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--sarir-color-surface-soft)",
          foreground: "var(--color-text-muted)",
        },
        accent: {
          DEFAULT: "var(--color-brand-accent)",
          foreground: "var(--color-text-main)",
        },
        popover: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-text-main)",
        },
        card: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-text-main)",
        },
      },
      borderRadius: {
        lg: "var(--sarir-radius-lg)",
        md: "var(--sarir-radius-md)",
        sm: "var(--sarir-radius-sm)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
