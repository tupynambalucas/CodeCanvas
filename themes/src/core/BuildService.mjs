import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { ColorExtractor } from './ColorExtractor.mjs';
import { ThemeResolver } from './ThemeResolver.mjs';
import { PackageRegistry } from './PackageRegistry.mjs';

export class BuildService {
  constructor(paths) {
    this.paths = paths;
    this.extractor = new ColorExtractor(paths.DEFAULTS_PATH);
    this.registry = new PackageRegistry(paths.ROOT_PACKAGE_JSON);
  }

  _formatLabel(str) {
    return str
      .split('.')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  }

  async run() {
    console.log('🚀 Iniciando build profissional...');
    const themeVariables = this.extractor.extract();
    const resolver = new ThemeResolver(themeVariables);
    const contributions = [];

    if (!fs.existsSync(this.paths.OUTPUT_PATH)) {
      fs.mkdirSync(this.paths.OUTPUT_PATH, { recursive: true });
    }

    const themeFiles = fg.sync(`${this.paths.DEFAULTS_PATH}/**/*-theme.json`.replace(/\\/g, '/'));

    for (const filePath of themeFiles) {
      // Lógica de extração de metadados exata do build.mjs original
      const relativeFromDefaults = path.relative(this.paths.DEFAULTS_PATH, filePath);
      const pathParts = relativeFromDefaults.split(path.sep);
      const category = pathParts[0];
      const subCategory = pathParts[1];

      const fileName = path.basename(filePath);
      const [rawName, rest] = fileName.split('_');
      const colorsPart = rest.replace('-theme.json', '');

      const themeNameLabel = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const subCatLabel = subCategory.charAt(0).toUpperCase() + subCategory.slice(1);
      const formattedColorLabel = this._formatLabel(colorsPart);

      const devTheme = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const templatePath = path.join(
        this.paths.TEMPLATES_PATH,
        `${devTheme.template || 'dark'}-template.json`,
      );

      if (!fs.existsSync(templatePath)) {
        continue;
      }

      const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      const generatedTheme = resolver.resolve(templateData, devTheme);

      // Nome e paths exatos
      generatedTheme.name = `${themeNameLabel} (${subCatLabel}) - ${formattedColorLabel}`;

      const safeColorId = colorsPart.replace(/\./g, '-');
      const outputFileName = `${category}.${subCategory}.${rawName}.${safeColorId}.json`;
      const outputPath = path.join(this.paths.OUTPUT_PATH, outputFileName);

      fs.writeFileSync(outputPath, JSON.stringify(generatedTheme, null, 2));

      contributions.push({
        id: `codecanvas.${subCategory}-${rawName}-${safeColorId}`,
        label: generatedTheme.name,
        uiTheme: generatedTheme.type === 'dark' ? 'vs-dark' : 'vs',
        path: `./src/themes/${outputFileName}`,
      });

      console.log(`✅ Gerado: ${outputFileName}`);
    }

    this.registry.register(contributions);
    console.log('✨ Build concluída!');
  }
}
