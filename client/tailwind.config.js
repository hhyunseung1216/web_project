/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
      "../api/**/*.js"
    ],
    theme: {
      extend: {
        colors: {
          brandSky: {
            light: "#E0F7FF",
            DEFAULT: "#7DD3FC",
            dark: "#38BDF8"
          }
        }
      }
    },
    plugins: []
  };
  