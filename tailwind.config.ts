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
        // Warm near-black surfaces. Page = darkest; cards sit lighter on top.
        cocoa: {
          950: "#160c04",
          900: "#1e1107",
          850: "#26160a",
          800: "#2f1c0d",
          700: "#3d2712",
          600: "#4d3318",
        },
        // Orange accent ramp used for buttons, badges, and highlights.
        flame: {
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
