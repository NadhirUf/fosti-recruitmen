import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      colors: {
        // Diambil dari desain Figma FOSTI: hitam pekat + merah aksen logo
        base: {
          bg: "#050505",
          panel: "#0d0d0d",
          border: "#232323",
        },
        brand: {
          red: "#e10600",
          redDark: "#a60400",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "serif"], // diganti dari Space Grotesk
        heavy: ["'Anton'", "'Space Grotesk'", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
} satisfies Config;
