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
          DEFAULT: "#1772D0",
          light: "#66D0FF",
          dark: "#155EB5",
        },
        "brand-secondary": {
          DEFAULT: "#F44336",
          light: "#F76A2E",
          dark: "#D9342D",
        },
        "brand-accent": {
          DEFAULT: "#72BF2E",
          light: "#D7F1B8",
          dark: "#50941F",
        },
        "brand-mint": "#66D0FF",
        "brand-sunshine": "#FFBE1A",
        "brand-berry": "#EF314D",
        "brand-lavender": "#66D0FF",
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
        "brand-blue": "0 16px 38px rgba(21, 94, 181, 0.22)",
        "brand-orange": "0 22px 46px rgba(244, 67, 54, 0.24)",
        "brand-pink": "0 20px 42px rgba(102, 208, 255, 0.2)",
        "brand-card": "0 22px 52px rgba(21, 94, 181, 0.12)",
        "brand-card-hover": "0 30px 78px rgba(21, 94, 181, 0.18)",
        "card-lg": "0 22px 52px rgba(21, 94, 181, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
