import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0A0F0A",
        "bg-surface": "#111A11",
        "bg-elevated": "#162016",
        "accent-primary": "#2ECC71",
        "accent-soft": "#1A7A42",
        "accent-warn": "#F39C12",
        "accent-danger": "#E74C3C",
        "text-primary": "#E8F5E9",
        "text-secondary": "#81C784",
        "text-muted": "#4A6741",
        border: "#1E2D1E",
      },
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      maxWidth: {
        content: "1280px",
      },
    },
  },
  plugins: [],
};
export default config;
