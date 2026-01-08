/** @type {import('tailwindcss').Config} */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para extrair variáveis --nome: #hex dos arquivos CSS
function indexThemeColors() {
  const colors = {};
  const srcDir = path.resolve(__dirname, './src/defaults');

  // Busca recursiva simples por arquivos .css
  const getFiles = (dir) => {
    let files = [];
    if (!fs.existsSync(dir)) {
      return files;
    }
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        files = files.concat(getFiles(filePath));
      } else if (file.endsWith('.css')) {
        files.push(filePath);
      }
    });
    return files;
  };

  const cssFiles = getFiles(srcDir);

  cssFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    // Regex para capturar --variavel: #hex
    const matches = content.matchAll(/(--[\w-]+):\s*(#[a-fA-F0-9]{3,8})/g);
    for (const match of matches) {
      console.log(match[1], match[2]);
      colors[match[1]] = match[2];
    }
  });

  return colors;
}

export default {
  content: ['src/**/*.json', 'src/**/*.css'],
  theme: {
    extend: {
      // O Tailwind agora "enxerga" todas as variáveis definidas nos seus CSSs
      colors: indexThemeColors(),
    },
  },
  plugins: [],
};
