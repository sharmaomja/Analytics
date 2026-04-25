/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#e2e8f0",
        accent: "#8b5cf6",
      },
      boxShadow: {
        card: "0 24px 60px rgba(15, 23, 42, 0.18)",
      },
    },
  },
  plugins: [],
};
