import * as vscode from 'vscode';
import * as path from 'path';

export async function detectAndApplyThemeBackground() {
    const currentTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
    if (!currentTheme) { return; }

    // Find the theme file in extensions or local themes
    const themes = vscode.extensions.all.flatMap(ext => {
        const themeContributes = (ext.packageJSON.contributes?.themes || []) as any[];
        return themeContributes.map(t => ({
            ...t,
            extensionPath: ext.extensionPath
        }));
    });

    const theme = themes.find(t => t.label === currentTheme || t.id === currentTheme);
    if (!theme) { return; }

    try {
        const themePath = path.isAbsolute(theme.path) ? theme.path : path.join(theme.extensionPath, theme.path);
        const themeUri = vscode.Uri.file(themePath);
        const content = await vscode.workspace.fs.readFile(themeUri);
        const themeJson = JSON.parse(content.toString());

        if (themeJson.backgroundConfig) {
            await vscode.workspace.getConfiguration('codecanvas').update('ui.background', themeJson.backgroundConfig, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`CodeCanvas: Applied background settings from theme "${currentTheme}".`);
        }
    } catch (e) {
        console.error('CodeCanvas: Failed to read theme file', e);
    }
}
