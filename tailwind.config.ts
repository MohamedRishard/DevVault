import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FFECCB", // Warm Cream
        crimson: {
          DEFAULT: "#E00000", // Bold Crimson
          hover: "#C00000",
          light: "#FFE5E5",
        },
        coral: {
          DEFAULT: "#FFA97B", // Warm Peach / Coral
          hover: "#FF9860",
          light: "#FFF1EB",
        },
        lime: {
          DEFAULT: "#9FED72", // Fresh Lime Green
          hover: "#8CDE5E",
          light: "#F0FDE8",
        },
        charcoal: {
          DEFAULT: "#1A1A1A",
          muted: "#4A4A4A",
          border: "#D1D5DB",
        },
      },
      fontFamily: {
        sans: [
          "'Plus Jakarta Sans'",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        vault: "0 4px 14px 0 rgba(224, 0, 0, 0.15)",
        card: "0 2px 8px -2px rgba(26, 26, 26, 0.08), 0 4px 16px -4px rgba(255, 169, 123, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
