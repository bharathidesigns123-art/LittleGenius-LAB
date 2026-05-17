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
          DEFAULT: "#005B9A",
          light: "#59C3FF",
          dark: "#123458",
        },
        "brand-secondary": {
          DEFAULT: "#FF6B00",
          light: "#FF8F1F",
          dark: "#C64D00",
        },
        "brand-accent": {
          DEFAULT: "#42D6A4",
          light: "#C7F5E5",
          dark: "#219B72",
        },
        "brand-mint": "#42D6A4",
        "brand-sunshine": "#FFC933",
        "brand-berry": "#FF8F1F",
        "brand-lavender": "#59C3FF",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "serif"],
      },
      borderRadius: {
        pill: "999px",
        "lg-rounded": "1.125rem",
        "xl-rounded": "1.75rem",
        "xxl-rounded": "2.5rem",
      },
      boxShadow: {
        "brand-blue": "0 16px 38px rgba(18, 52, 88, 0.2)",
        "brand-orange": "0 22px 46px rgba(255, 107, 0, 0.24)",
        "brand-pink": "0 20px 42px rgba(89, 195, 255, 0.18)",
        "brand-card": "0 22px 52px rgba(18, 52, 88, 0.12)",
        "brand-card-hover": "0 30px 78px rgba(18, 52, 88, 0.18)",
        "card-lg": "0 22px 52px rgba(18, 52, 88, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
