import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D1B2A",
        ocean: "#162235",
        surf: "#E8F5EA",
        mint: "#16A34A",
        sand: "#F5F7F9",
        sunrise: "#22C55E",
        slatebrand: "#64748B",
        danger: "#ff7a7a",
      },
      boxShadow: {
        glow: "0 18px 60px rgba(9, 28, 39, 0.20)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["Poppins", "Segoe UI Variable", "Aptos", "sans-serif"],
        display: ["Poppins", "Segoe UI Variable", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
