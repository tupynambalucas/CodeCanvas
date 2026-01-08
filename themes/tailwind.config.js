/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.json', './src/**/*.css'],
  theme: {
    extend: {
      colors: {
        // Exemplo: você pode mapear cores do tema aqui para usar como utilitários
        'yoruichi-purple': '#ff00ff',
        'yoruichi-bg': '#0f0f0f',
      },
    },
  },
  plugins: [],
};
