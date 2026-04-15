import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        stone: "#6b7280",
        sand: "#f8fafc",
        edge: "#e5e7eb",
        brand: "#0f766e",
        // Archetype accent colors
        "archetype-family": "#d97706",      // amber-600
        "archetype-stable": "#16a34a",      // green-600
        "archetype-commuter": "#2563eb",    // blue-600
        "archetype-affluent": "#7c3aed",    // violet-600
        "archetype-transitional": "#ea580c", // orange-600
        "archetype-mature": "#475569"       // slate-600
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.04)"
      }
    }
  },
  plugins: []
};

export default config;
