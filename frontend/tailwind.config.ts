import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
import { b } from "framer-motion/client";

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
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [heroui()],
} satisfies Config;
