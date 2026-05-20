// tailwind.config.mjs

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        tacir: {
          pink: "#BF1573",
          darkblue: "#2D3773",
          blue: "#303E8C",
          lightblue: "#04ADBF",
          green: "#56A632",
          yellow: "#F29F05",
          orange: "#F29F05",
          darkgray: "#7B797A",
          lightgray: "#F2F2F2",
        },
      },
    },
  },
  plugins: [],
};
