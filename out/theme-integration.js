"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectAndApplyThemeBackground = detectAndApplyThemeBackground;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
async function detectAndApplyThemeBackground() {
    const currentTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
    if (!currentTheme) {
        return;
    }
    // Find the theme file in extensions or local themes
    const themes = vscode.extensions.all.flatMap(ext => {
        const themeContributes = (ext.packageJSON.contributes?.themes || []);
        return themeContributes.map(t => ({
            ...t,
            extensionPath: ext.extensionPath
        }));
    });
    const theme = themes.find(t => t.label === currentTheme || t.id === currentTheme);
    if (!theme) {
        return;
    }
    try {
        const themePath = path.isAbsolute(theme.path) ? theme.path : path.join(theme.extensionPath, theme.path);
        const themeUri = vscode.Uri.file(themePath);
        const content = await vscode.workspace.fs.readFile(themeUri);
        const themeJson = JSON.parse(content.toString());
        if (themeJson.backgroundConfig) {
            await vscode.workspace.getConfiguration('codecanvas').update('ui.background', themeJson.backgroundConfig, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`CodeCanvas: Applied background settings from theme "${currentTheme}".`);
        }
    }
    catch (e) {
        console.error('CodeCanvas: Failed to read theme file', e);
    }
}
//# sourceMappingURL=theme-integration.js.map