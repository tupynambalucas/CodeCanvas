import * as vscode from 'vscode';

/**
 * VSCode helper methods
 */
export const vsHelp = new (class {
    /**
     * Shows reload window prompt
     *
     * @param {string} message Reload message
     * @param {string} btnText Button text
     * @param {Function} beforeReload Callback before reload
     * @memberof VsHelp
     */
    public reload(options: { message?: string; btnReload?: string; beforeReload?: Function } = {}) {
        const { message = 'Configuration changed, please reload window.', btnReload = 'Reload', beforeReload } = options;

        vscode.window.showInformationMessage(message, btnReload).then(async selection => {
            if (btnReload === selection) {
                beforeReload && (await beforeReload());
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });
    }
})();