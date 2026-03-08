/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FF0000",
          dark: "#CC0000",
        },
        dark: {
          bg: "#0f0f0f",
          surface: "#212121",
          elevated: "#272727",
          border: "#3f3f3f",
          text: "#f1f1f1",
          subtext: "#aaaaaa",
        },
      },
    },
  },
  plugins: [],
};
