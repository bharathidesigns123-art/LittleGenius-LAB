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
          DEFAULT: "#576d95",
          light: "#bac9df",
          dark: "#1f2a3e",
        },
        "brand-secondary": {
          DEFAULT: "#d07d55",
          light: "#efc6ae",
          dark: "#9e5634",
        },
        "brand-accent": {
          DEFAULT: "#b7c8bf",
          light: "#dde7e1",
          dark: "#7e988b",
        },
        "brand-mint": "#92b9aa",
        "brand-sunshine": "#eccfaa",
        "brand-berry": "#cd8e78",
        "brand-lavender": "#c7ccdc",
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
        "brand-blue": "0 14px 34px rgba(30, 41, 73, 0.18)",
        "brand-orange": "0 18px 40px rgba(208, 125, 85, 0.18)",
        "brand-pink": "0 18px 40px rgba(183, 200, 191, 0.2)",
        "brand-card": "0 18px 44px rgba(30, 41, 73, 0.08)",
        "brand-card-hover": "0 26px 70px rgba(30, 41, 73, 0.14)",
        "card-lg": "0 18px 44px rgba(30, 41, 73, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
