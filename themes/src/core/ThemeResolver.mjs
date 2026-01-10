export class ThemeResolver {
  constructor(colorMap) {
    this.colorMap = colorMap;
  }

  resolve(templateData, devTheme) {
    const rawColors = { ...templateData.colors, ...devTheme.colors };
    const resolvedColors = {};

    for (const [key, value] of Object.entries(rawColors)) {
      if (typeof value === 'string') {
        const cleanKey = value.replace(/^--/, '');
        resolvedColors[key] = this.colorMap[cleanKey] || value;
      } else {
        resolvedColors[key] = value;
      }
    }

    return {
      $schema: 'vscode://schemas/color-theme',
      type: templateData.type || 'dark',
      colors: resolvedColors,
      tokenColors: [...(templateData.tokenColors || []), ...(devTheme.tokenColors || [])],
      backgroundConfig: devTheme.backgroundConfig || {},
    };
  }
}
