/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // TUS COLORES ORIGINALES (No los borramos para no romper otras páginas de golpe)
        primary: "#f48c25",
        "background-light": "#f8f7f5",
        "background-dark": "#221910",

        // NUEVA PALETA "AURA / ESTETICME PREMIUM"
        "aura-lavender": "#F4F0F8", // Fondo principal súper suave
        "aura-plum": "#2A1B29", // El tono oscuro del footer
        "aura-text": "#1F1520", // Para los textos oscuros
        "aura-pearl": "#FDFBFF", // Blanco nacarado
      },
      fontFamily: {
        // Tu fuente original para textos normales
        display: ["Manrope", "sans-serif"],
        sans: ["Manrope", "sans-serif"],
        // La nueva fuente elegante para los títulos grandes
        serif: ["Playfair Display", "serif", "Times New Roman"],
      },
      boxShadow: {
        // Las sombras para hacer el efecto Glassmorphism / Botón Perla
        pearl: "0 4px 15px rgba(200, 160, 255, 0.25)",
        "pearl-hover": "0 6px 20px rgba(200, 160, 255, 0.45)",
      },
    },
  },
  plugins: [],
};
