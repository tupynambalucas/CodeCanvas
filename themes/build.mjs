import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Correção do Import para evitar o SyntaxError
import fg from 'fast-glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Caminhos base relativos à pasta themes
const ROOT_PATH = path.join(__dirname, '..');
const THEMES_SRC = path.join(__dirname, 'src');
const DEFAULTS_PATH = path.join(THEMES_SRC, 'defaults');
const TEMPLATES_PATH = path.join(THEMES_SRC, 'templates');
const OUTPUT_PATH = path.join(ROOT_PATH, 'src', 'themes');
const ROOT_PACKAGE_JSON = path.join(ROOT_PATH, 'package.json');

const formatLabel = (str) =>
  str
    .split('.')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

async function buildThemes() {
  console.log('🚀 Iniciando build e atualização de contribuições...');

  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }

  // O fast-glob exige barras normais (/) mesmo no Windows
  const themeFiles = fg.sync(`${DEFAULTS_PATH}/**/*-theme.json`.replace(/\\/g, '/'));
  const contributions = [];

  for (const filePath of themeFiles) {
    // 1. Identifica Categoria e Sub-categoria pela estrutura de pastas
    const relativeFromDefaults = path.relative(DEFAULTS_PATH, filePath);
    const pathParts = relativeFromDefaults.split(path.sep);
    const category = pathParts[0]; // Ex: anime
    const subCategory = pathParts[1]; // Ex: bleach

    // 2. Parse do nome do arquivo: yoruichi_dark.purple-theme.json
    const fileName = path.basename(filePath);
    const [rawName, rest] = fileName.split('_');
    const colorsPart = rest.replace('-theme.json', ''); // "dark.purple"

    const themeNameLabel = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const subCatLabel = subCategory.charAt(0).toUpperCase() + subCategory.slice(1);
    const formattedColorLabel = formatLabel(colorsPart);

    // 3. Carregamento do Tema e Template
    const devTheme = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const templateName = devTheme.template || 'dark';
    const templatePath = path.join(TEMPLATES_PATH, `${templateName}-template.json`);

    if (!fs.existsSync(templatePath)) {
      console.warn(`⚠️ Template ${templateName} não encontrado para ${fileName}.`);
      continue;
    }

    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

    // 4. Merge: Template + Customizações do Tema
    const generatedTheme = {
      $schema: 'vscode://schemas/color-theme',
      name: `${themeNameLabel} (${subCatLabel}) - ${formattedColorLabel}`,
      type: templateData.type || 'dark',
      colors: { ...templateData.colors, ...devTheme.colors },
      tokenColors: [...(templateData.tokenColors || []), ...(devTheme.tokenColors || [])],
      backgroundConfig: devTheme.backgroundConfig || {},
    };

    // 5. Nome do Arquivo Final: anime.bleach.yoruichi.dark-purple.json
    const safeColorId = colorsPart.replace(/\./g, '-');
    const outputFileName = `${category}.${subCategory}.${rawName}.${safeColorId}.json`;
    const outputPath = path.join(OUTPUT_PATH, outputFileName);

    fs.writeFileSync(outputPath, JSON.stringify(generatedTheme, null, 2));

    // 6. Registro para o package.json
    contributions.push({
      id: `codecanvas.${subCategory}-${rawName}-${safeColorId}`,
      label: generatedTheme.name,
      uiTheme: generatedTheme.type === 'dark' ? 'vs-dark' : 'vs',
      path: `./src/themes/${outputFileName}`,
    });

    console.log(`✅ Gerado: ${outputFileName}`);
  }

  // 7. Atualização Automática das Contribuições no Root
  const pkg = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON, 'utf8'));
  pkg.contributes.themes = contributions;
  fs.writeFileSync(ROOT_PACKAGE_JSON, JSON.stringify(pkg, null, 2));

  console.log('✨ Build concluída e package.json atualizado!');
}

buildThemes().catch(console.error);
