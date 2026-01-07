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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const Background_1 = require("./background/Background");
// Removed: import { detectAndApplyThemeBackground } from './theme-integration';
function activate(context) {
    const backgroundManager = new Background_1.BackgroundManager(context);
    context.subscriptions.push(backgroundManager);
    // Theme integration listener is now handled within BackgroundManager's onConfigChange
    // and will trigger background updates based on theme configuration.
    // Removed:
    // context.subscriptions.push(
    // 	vscode.workspace.onDidChangeConfiguration(e => {
    // 		if (e.affectsConfiguration('workbench.colorTheme')) {
    // 			detectAndApplyThemeBackground();
    // 		}
    // 	})
    // );
    // Initial check is now handled within BackgroundManager's constructor
    // Removed: detectAndApplyThemeBackground();
    context.subscriptions.push(vscode.commands.registerCommand('codecanvas.install', async () => {
        // This command will now just set the 'enabled' flag, which triggers onConfigChange
        await vscode.workspace.getConfiguration('codecanvas').update('enabled', true, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('CodeCanvas: Enabling backgrounds. Please reload VS Code if prompted.');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('codecanvas.uninstallPatch', async () => {
        // This command now just calls uninstall directly
        const success = await backgroundManager.uninstall();
        if (success) {
            vscode.window.showInformationMessage('CodeCanvas: Patch uninstalled successfully. Please reload VS Code.', 'Reload')
                .then(selection => {
                if (selection === 'Reload') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('codecanvas.disable', async () => {
        await vscode.workspace.getConfiguration('codecanvas').update('enabled', false, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('CodeCanvas: Backgrounds disabled. Please reload VS Code if prompted.');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('codecanvas.info', async () => {
        const installed = await backgroundManager.hasInstalled();
        vscode.window.showInformationMessage(`CodeCanvas: Patch ${installed ? 'is' : 'is NOT'} installed.`);
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map