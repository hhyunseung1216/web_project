/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",              // Vite의 진입 HTML
    "./src/**/*.{js,jsx,ts,tsx}",// React 컴포넌트들
    "../api/**/*.js"             // (선택) 서버리스 함수
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
