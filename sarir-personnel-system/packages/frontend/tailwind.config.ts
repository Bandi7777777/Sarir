import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // اسکن همه فایل‌های JSX/TSX
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // رنگ‌های سازمانی SARIR
        turquoise: {
          '50': '#f0f9fb',
          '100': '#d1e8ef',
          '200': '#a3d8e4',
          '300': '#76c8d9',
          '400': '#4ab8cf',
          '500': '#1da8c5',
          '600': '#168fad',
          '700': '#0f768f',
          '800': '#07657e',
          '900': '#054d60',
        },
        orange: {
          '50': '#fff8e7',
          '100': '#ffe8b6',
          '200': '#ffd78d',
          '300': '#ffc664',
          '400': '#ffb53a',
          '500': '#f2991f',
          '600': '#d87a1a',
          '700': '#b86115',
          '800': '#994710',
          '900': '#7b2e0b',
        },
        gray: {
          '50': '#f9fafb',
          '100': '#f3f4f6',
          '200': '#e5e7eb',
          '300': '#d1d5db',
          '400': '#9ca3af',
          '500': '#6b7280',
          '600': '#4b5563',
          '700': '#374151',
          '800': '#1f2937',
          '900': '#111827',
        },
      },
      boxShadow: {
        'neon': '0 0 15px rgba(7, 101, 126, 0.5), 0 0 30px rgba(242, 153, 31, 0.3)',
        'neon-soft': '0 0 10px rgba(7, 101, 126, 0.3), 0 0 20px rgba(242, 153, 31, 0.2)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(7, 101, 126, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(7, 101, 126, 0.6)' },
        },
      },
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;