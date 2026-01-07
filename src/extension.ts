import * as vscode from 'vscode';
import { BackgroundManager } from './background/Background';
// Removed: import { detectAndApplyThemeBackground } from './theme-integration';

export function activate(context: vscode.ExtensionContext) {
	const backgroundManager = new BackgroundManager(context);
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

	context.subscriptions.push(
		vscode.commands.registerCommand('codecanvas.install', async () => {
			// This command will now just set the 'enabled' flag, which triggers onConfigChange
			await vscode.workspace.getConfiguration('codecanvas').update('enabled', true, vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage('CodeCanvas: Enabling backgrounds. Please reload VS Code if prompted.');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codecanvas.uninstallPatch', async () => {
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
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codecanvas.disable', async () => {
			await vscode.workspace.getConfiguration('codecanvas').update('enabled', false, vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage('CodeCanvas: Backgrounds disabled. Please reload VS Code if prompted.');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codecanvas.info', async () => {
			const installed = await backgroundManager.hasInstalled();
			vscode.window.showInformationMessage(`CodeCanvas: Patch ${installed ? 'is' : 'is NOT'} installed.`);
		})
	);
}

export function deactivate() {}
