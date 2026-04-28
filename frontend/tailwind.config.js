/** Tailwind configuration mapping core design tokens to CSS variables defined in globals.css */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-blue)',
        secondary: 'var(--color-orange)',
        accent: 'var(--color-yellow)',
        ink: 'var(--color-ink)',
        'ink-soft': 'var(--color-ink-soft)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        card: 'var(--color-card)',
        border: 'var(--color-border)'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-display)', 'serif']
      },
      borderRadius: {
        pill: '999px',
        'lg-rounded': '1.6rem',
        'xl-rounded': '2rem',
        'xxl-rounded': '2.5rem'
      },
      boxShadow: {
        'card-lg': '0 24px 60px rgba(var(--shadow-rgb), 0.12)'
      }
    }
  },
  plugins: []
};
