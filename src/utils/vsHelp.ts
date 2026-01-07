import * as vscode from 'vscode';

/**
 * VSCode 相关的帮助方法
 */
export const vsHelp = new (class {
    /**
     * 显示重新加载的弹窗
     *
     * @param {string} message 重新加载信息
     * @param {string} btnText 按钮文字
     * @param {Function} beforeReload 重新加载前的回调
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