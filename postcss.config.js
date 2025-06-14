// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': { config: './tailwind.config.ts' }, // Explicitly use the package and point to your Tailwind config
    'autoprefixer': {},
  },
};