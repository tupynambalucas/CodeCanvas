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
exports.vsHelp = void 0;
const vscode = __importStar(require("vscode"));
/**
 * VSCode 相关的帮助方法
 */
exports.vsHelp = new (class {
    /**
     * 显示重新加载的弹窗
     *
     * @param {string} message 重新加载信息
     * @param {string} btnText 按钮文字
     * @param {Function} beforeReload 重新加载前的回调
     * @memberof VsHelp
     */
    reload(options = {}) {
        const { message = 'Configuration changed, please reload window.', btnReload = 'Reload', beforeReload } = options;
        vscode.window.showInformationMessage(message, btnReload).then(async (selection) => {
            if (btnReload === selection) {
                beforeReload && (await beforeReload());
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });
    }
})();
//# sourceMappingURL=vsHelp.js.map