import * as vscode from 'vscode';
import { BackgroundManager } from './background/Background';
// Import necessary for automatic theme detection
import { detectAndApplyThemeBackground } from './theme-integration';

export function activate(context: vscode.ExtensionContext) {
  const backgroundManager = new BackgroundManager(context);
  context.subscriptions.push(backgroundManager);

  // Listen for workbench theme changes to automatically apply backgrounds
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('workbench.colorTheme')) {
        detectAndApplyThemeBackground();
      }
    }),
  );

  // Initial execution on extension activation
  detectAndApplyThemeBackground();

  context.subscriptions.push(
    vscode.commands.registerCommand('codecanvas.install', async () => {
      await vscode.workspace
        .getConfiguration('codecanvas')
        .update('enabled', true, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(
        'CodeCanvas: Ativando backgrounds. Por favor, recarregue o VS Code.',
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codecanvas.uninstallPatch', async () => {
      const success = await backgroundManager.uninstall();
      if (success) {
        vscode.window
          .showInformationMessage(
            'CodeCanvas: Patch removido. Por favor, recarregue o VS Code.',
            'Recarregar',
          )
          .then((selection) => {
            if (selection === 'Recarregar') {
              vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
          });
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codecanvas.disable', async () => {
      await vscode.workspace
        .getConfiguration('codecanvas')
        .update('enabled', false, vscode.ConfigurationTarget.Global);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codecanvas.info', async () => {
      const installed = await backgroundManager.hasInstalled();
      vscode.window.showInformationMessage(
        `CodeCanvas: Patch ${installed ? 'está' : 'NÃO está'} instalado.`,
      );
    }),
  );
}

export function deactivate() {}
