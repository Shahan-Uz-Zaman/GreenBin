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
        forest: {
          DEFAULT: "#228B52",
          dark: "#1A6E40",
          light: "#2BA662",
          subtle: "#E8F5E9",
          50: "#F1F8F4",
          100: "#E8F5E9",
          200: "#C8E6C9",
          500: "#228B52",
          600: "#1A6E40",
          700: "#145431",
        },
        recycle: {
          DEFAULT: "#1E88E5",
          subtle: "#E3F2FD",
          border: "#BBDEFB",
        },
        bio: {
          DEFAULT: "#228B52",
          subtle: "#E8F5E9",
          border: "#C8E6C9",
        },
        hazard: {
          DEFAULT: "#E53935",
          subtle: "#FFEBEE",
          border: "#FFCDD2",
        },
      },
    },
  },
  plugins: [],
};
export default config;
