/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f48c25",
        "background-light": "#f8f7f5",
        "background-dark": "#221910",
      },
      fontFamily: { display: ["Manrope", "sans-serif"] },
    },
  },
  plugins: [],
};
