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
        'pubnubtext': '#171717',
        'pubnubtextlight': '#FAFAFA',
        'pubnublightgray': '#D4D4D4',
        'pubnubnavy': '#161C2D',
        'pubnublightnavy': '#FAFAFC',
        'pubnubbabyblue': '#C3E6FA',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
