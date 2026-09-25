import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0F1A", // Deep cinematic dark
        surface: {
          DEFAULT: "#111827", // Soft dark gray cards
          muted: "#182234",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "#1C283C",
          glass: "rgba(17, 24, 39, 0.75)",
        },
        gold: {
          DEFAULT: "#D4AF37", // Egyptian Sphinx Gold
          glow: "#FFD700",
          dark: "#A6821A",
          light: "#F7E188",
          subtle: "rgba(212, 175, 55, 0.15)",
        },
        cyan: {
          DEFAULT: "#00E5FF", // Tech / Live Cyan Glow
          glow: "#33EBFF",
          dark: "#009BB0",
          subtle: "rgba(0, 229, 255, 0.15)",
        },
        accent: {
          red: "#EF4444", // Pure Red LIVE indicator
        },
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        gold: "0 0 25px -4px rgba(212, 175, 55, 0.35)",
        cyan: "0 0 25px -4px rgba(0, 229, 255, 0.35)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.6)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.8)",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
