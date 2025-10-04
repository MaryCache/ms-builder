// postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // ← これに変更！
    autoprefixer: {},
  },
}
