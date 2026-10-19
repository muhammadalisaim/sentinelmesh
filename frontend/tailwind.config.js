/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: "#111827",
        surfaceBorder: "#1f293d",
        brand: {
          50: "#f0fdf4",
          500: "#10b981",
          600: "#059669",
        },
        amd: {
          red: "#ed1c24",
          dark: "#1e0809",
        },
        cyber: {
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          amber: "#f59e0b",
          rose: "#f43f5e",
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
        urdu: ["'Noto Nastaliq Urdu'", "'Jameel Noori Nastaleeq'", "sans-serif"],
      }
    },
  },
  plugins: [],
};
