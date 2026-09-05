/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f3f5fa",
          100: "#e4e8f2",
          200: "#c3cbe0",
          300: "#96a3c6",
          400: "#6577a8",
          500: "#425489",
          600: "#2f3f6e",
          700: "#243259",
          800: "#1a2544",
          900: "#131b34",
          950: "#0c1224",
        },
        amber: {
          50: "#fdf6e8",
          100: "#faead0",
          200: "#f3d19b",
          300: "#ecb765",
          400: "#e6a03d",
          500: "#dc8a1f",
          600: "#b96e17",
          700: "#8f5416",
          800: "#734419",
          900: "#5f3919",
        },
        teal: {
          50: "#eefaf6",
          100: "#d3f2e7",
          200: "#a5e3d0",
          300: "#6fceb4",
          400: "#3fb598",
          500: "#279a7f",
          600: "#1c7d68",
          700: "#186454",
          800: "#164f45",
          900: "#14413a",
        },
        paper: "#faf9f5",
      },
      fontFamily: {
        display: ["'Sora'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(19,27,52,0.04), 0 4px 16px rgba(19,27,52,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
