import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8ecbff",
          400: "#59acff",
          500: "#3389ff",
          600: "#1b69f5",
          700: "#1453e1",
          800: "#1743b6",
          900: "#193c8f",
          950: "#142757",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae2",
          300: "#b0bac9",
          400: "#8594ab",
          500: "#667791",
          600: "#515f78",
          700: "#424d61",
          800: "#394252",
          900: "#333947",
          950: "#0b0e17",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(51,137,255,0.18), 0 12px 40px -12px rgba(51,137,255,0.35)",
        card: "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -12px rgba(15,23,42,0.18)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
    },
  },
  plugins: [],
};

export default config;