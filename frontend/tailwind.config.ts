import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        ink: "hsl(var(--ink) / <alpha-value>)",
        "ink-soft": "hsl(var(--ink-soft) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-2": "hsl(var(--surface-2) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        "brand-primary": {
          DEFAULT: "#06B6D4",
          light: "#67E8F9",
          dark: "#0284C7",
        },
        "brand-secondary": {
          DEFAULT: "#FF7A1A",
          light: "#FDBA74",
          dark: "#EA580C",
        },
        "brand-accent": {
          DEFAULT: "#D946EF",
          light: "#F0ABFC",
          dark: "#A21CAF",
        },
        "brand-mint": "#34D399",
        "brand-sunshine": "#FACC15",
        "brand-berry": "#EC4899",
        "brand-lavender": "#8B5CF6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "serif"],
      },
      borderRadius: {
        pill: "999px",
        "lg-rounded": "1.6rem",
        "xl-rounded": "2rem",
        "xxl-rounded": "2.5rem",
      },
      boxShadow: {
        "brand-blue": "0 18px 42px rgba(6, 182, 212, 0.28)",
        "brand-orange": "0 18px 42px rgba(255, 122, 26, 0.28)",
        "brand-pink": "0 18px 42px rgba(217, 70, 239, 0.24)",
        "brand-card": "0 18px 46px rgba(6, 182, 212, 0.12)",
        "brand-card-hover":
          "0 24px 60px rgba(6, 182, 212, 0.2), 0 10px 28px rgba(217, 70, 239, 0.14)",
        "card-lg": "0 18px 46px rgba(6, 182, 212, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
