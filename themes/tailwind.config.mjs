import { ColorExtractor } from './src/core/ColorExtractor.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extractor = new ColorExtractor(path.resolve(__dirname, './src/defaults'));
const themeColors = extractor.extract();

export default {
  content: ['./src/**/*.{json,css,mjs}'],
  theme: {
    extend: { colors: themeColors },
  },
  plugins: [
    ({ addUtilities }) => {
      const utils = {};
      Object.entries(themeColors).forEach(([name, val]) => {
        utils[`.${name}`] = { color: val };
      });
      addUtilities(utils);
    },
  ],
};
