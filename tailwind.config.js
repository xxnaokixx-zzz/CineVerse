/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6D28D9",
        secondary: "#4C1D95",
        dark: "#121212",
        darkgray: "#1E1E1E",
        lightgray: "#2A2A2A",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
    screens: {
      'iphonepro': '430px', // iPhone 16 Pro/Pro Max 幅
      'iphonemax': '932px', // iPhone 16 Pro Max 高さ（縦向き用）
      // 既存のsm, md, ...はデフォルトで有効
    },
  },
  plugins: [],
}; 