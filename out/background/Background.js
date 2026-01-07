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
exports.BackgroundManager = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const PatchFile_1 = require("./PatchFile");
const PatchGenerator_1 = require("./PatchGenerator");
const vscodePath_1 = require("../utils/vscodePath");
const vsHelp_1 = require("../utils/vsHelp");
const constants_1 = require("../utils/constants");
class BackgroundManager {
    context;
    disposables = [];
    jsFile;
    constructor(context) {
        this.context = context;
        this.jsFile = new PatchFile_1.JsPatchFile(vscodePath_1.vscodePath.jsPath);
        this.checkFirstload();
        this.registerListeners();
    }
    get config() {
        const cfg = vscode.workspace.getConfiguration(constants_1.EXTENSION_NAME);
        const ui = cfg.get('ui') || {}; // Default to empty object if ui is undefined
        // Legacy config properties for backward compatibility
        const legacyConfig = {
            useFront: cfg.get('useFront'),
            style: cfg.get('style'),
            styles: cfg.get('styles'),
            customImages: cfg.get('customImages'),
            interval: cfg.get('interval')
        };
        return {
            enabled: cfg.get('enabled', true),
            ...ui,
            ...legacyConfig
        };
    }
    async checkFirstload() {
        const firstLoad = !fs.existsSync(constants_1.TOUCH_FILE_PATH);
        if (firstLoad) {
            // Mark extension as started
            await fs.promises.writeFile(constants_1.TOUCH_FILE_PATH, vscodePath_1.vscodePath.jsPath, constants_1.ENCODING);
            return true;
        }
        return false;
    }
    async onConfigChange() {
        const hasInstalled = await this.hasInstalled();
        const enabled = this.config.enabled;
        if (!enabled) {
            if (hasInstalled) {
                vsHelp_1.vsHelp.reload({
                    message: `CodeCanvas: Backgrounds will be disabled.`,
                    btnReload: 'Disable and Reload',
                    beforeReload: () => this.uninstall()
                });
            }
            return;
        }
        vsHelp_1.vsHelp.reload({
            message: `CodeCanvas: Configuration has been changed, click to apply.`,
            btnReload: 'Apply and Reload',
            beforeReload: () => this.install()
        });
    }
    registerListeners() {
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(async (ex) => {
            const affectsCodeCanvas = ex.affectsConfiguration(constants_1.EXTENSION_NAME);
            if (!affectsCodeCanvas) {
                return;
            }
            this.onConfigChange();
        }));
    }
    async install() {
        // Generate patch content based on current configuration
        const scriptContent = PatchGenerator_1.PatchGenerator.create(this.config);
        const success = await this.jsFile.applyPatches(scriptContent);
        if (success) {
            vscode.window.showInformationMessage('CodeCanvas: Patch applied successfully.');
        }
        else {
            vscode.window.showErrorMessage('CodeCanvas: Failed to apply patch.');
        }
        return success;
    }
    async uninstall() {
        const success = await this.jsFile.restore();
        if (success) {
            vscode.window.showInformationMessage('CodeCanvas: Patch uninstalled successfully.');
        }
        else {
            vscode.window.showErrorMessage('CodeCanvas: Failed to uninstall patch.');
        }
        return success;
    }
    async hasInstalled() {
        return this.jsFile.hasPatched();
    }
    async apply(area, cfg) {
        // This method will be more complex, likely calling PatchGenerator with specific area configs
        // For now, it's a placeholder.
        vscode.window.showInformationMessage(`Apply background to ${area} is not yet fully implemented.`);
    }
    async remove(area) {
        // Similar to apply, this will interact with the patching mechanism
        vscode.window.showInformationMessage(`Remove background from ${area} is not yet fully implemented.`);
    }
    async applyFullscreen(cfg) {
        // This will call PatchGenerator with the fullscreen config
        vscode.window.showInformationMessage(`Apply fullscreen background is not yet fully implemented.`);
    }
    async restoreAll() {
        return this.uninstall();
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.BackgroundManager = BackgroundManager;
//# sourceMappingURL=Background.js.map