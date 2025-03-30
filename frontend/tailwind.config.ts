import type { Config } from "tailwindcss";

const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "custom-blue": "#7f9cf5",
        "custom-purple": "#3B03FF",
        "primary-blue": "#1b44b3",
        "primary-blue-hover": "#1e4dbd",
      },
      fontFamily: {
        montserrat: ['"Montserrat"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
} satisfies Config;
