/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:    'rgb(var(--primary)    / <alpha-value>)',
        secondary:  'rgb(var(--secondary)  / <alpha-value>)',
        accent:     'rgb(var(--accent)     / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        surface:    'rgb(var(--surface)    / <alpha-value>)',
        content:    'rgb(var(--content)    / <alpha-value>)',
        subtle:     'rgb(var(--subtle)     / <alpha-value>)',
        success:    'rgb(var(--success)    / <alpha-value>)',
        error:      'rgb(var(--error)      / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
