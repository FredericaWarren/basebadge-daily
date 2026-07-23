import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070A12",
        panel: "#111724",
        line: "#263044",
        baseblue: "#0052FF",
        mint: "#40DDB6",
        amber: "#F6C85F"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(0, 82, 255, 0.24)"
      }
    }
  },
  plugins: []
};

export default config;
