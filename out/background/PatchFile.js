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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsPatchFile = exports.AbsPatchFile = exports.EFilePatchType = void 0;
const crypto_1 = require("crypto");
const fs_1 = __importStar(require("fs"));
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const vscode = __importStar(require("vscode")); // Using * as vscode for consistency and to avoid conflicts
const constants_1 = require("../utils/constants");
const sudo_1 = require("../utils/sudo");
var EFilePatchType;
(function (EFilePatchType) {
    /**
     * Unmodified file
     */
    EFilePatchType[EFilePatchType["None"] = 0] = "None";
    /**
     * Patched old version of the file
     */
    EFilePatchType[EFilePatchType["Legacy"] = 1] = "Legacy";
    /**
     * Patched new version of the file
     */
    EFilePatchType[EFilePatchType["Latest"] = 2] = "Latest";
})(EFilePatchType || (exports.EFilePatchType = EFilePatchType = {}));
/**
 * Abstract class for file patching operations
 */
class AbsPatchFile {
    filePath;
    constructor(filePath) {
        this.filePath = filePath;
    }
    /**
     * Checks if the file has been patched
     */
    async hasPatched() {
        const editType = await this.getPatchType();
        return editType !== EFilePatchType.None;
    }
    /**
     * Gets the current patch status of the file
     */
    async getPatchType() {
        const content = await this.getContent();
        // Patched new version
        if (content.includes(`${constants_1.BACKGROUND_VER}.${constants_1.VERSION}`)) {
            return EFilePatchType.Latest;
        }
        // Patched old version (contains BACKGROUND_VER but not the current VERSION)
        if (content.includes(constants_1.BACKGROUND_VER)) {
            return EFilePatchType.Legacy;
        }
        return EFilePatchType.None;
    }
    async getContent() {
        return fs_1.default.promises.readFile(this.filePath, constants_1.ENCODING);
    }
    async saveContentTo(targetFilePath, content) {
        try {
            if (fs_1.default.existsSync(targetFilePath)) {
                await fs_1.default.promises.access(targetFilePath, fs_1.constants.W_OK);
            }
            await fs_1.default.promises.writeFile(targetFilePath, content, constants_1.ENCODING);
            return true;
        }
        catch (e) {
            const retry = 'Retry with Admin/Sudo';
            const result = await vscode.window.showErrorMessage(`Failed to write to file: ${e.message}. Attempt to write with elevated privileges?`, retry);
            if (result !== retry) {
                return false;
            }
            const tempFilePath = path_1.default.join((0, os_1.tmpdir)(), `codecanvas-temp-${(0, crypto_1.randomUUID)()}.temp`);
            await fs_1.default.promises.writeFile(tempFilePath, content, constants_1.ENCODING);
            try {
                const mvcmd = process.platform === 'win32' ? 'move /Y' : 'mv -f';
                const cmdarg = `${mvcmd} "${tempFilePath}" "${targetFilePath}"`;
                await (0, sudo_1.sudoExec)(cmdarg, { name: 'CodeCanvas Extension' });
                return true;
            }
            catch (e) {
                vscode.window.showErrorMessage(`Failed to write with elevated privileges: ${e.message}`);
                // Provide a link to common issues if applicable
                return false;
            }
            finally {
                await fs_1.default.promises.rm(tempFilePath, { force: true });
            }
        }
    }
    async write(content) {
        if (!content.trim().length) {
            return false;
        }
        return this.saveContentTo(this.filePath, content);
    }
    async restore() {
        try {
            let content = await this.getContent();
            content = this.cleanPatches(content);
            return await this.write(content);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Failed to restore file: ${e.message}`);
            return false;
        }
    }
}
exports.AbsPatchFile = AbsPatchFile;
/**
 * JavaScript file patching operations
 */
class JsPatchFile extends AbsPatchFile {
    async applyPatches(patchContent) {
        try {
            const curContent = await this.getContent();
            let content = this.cleanPatches(curContent);
            content += [
                `\n// codecanvas-background-start ${constants_1.BACKGROUND_VER}.${constants_1.VERSION}`,
                patchContent,
                '// codecanvas-background-end'
            ].join('\n');
            // file unchanged
            if (curContent === content) {
                return true;
            }
            return await this.write(content);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Failed to apply patches to JS file: ${e.message}`);
            return false;
        }
    }
    cleanPatches(content) {
        // Use a more specific regex to avoid conflicts with other comments
        content = content.replace(/\n\/\/ codecanvas-background-start[\s\S]*?\/\/ codecanvas-background-end/, '');
        return content;
    }
}
exports.JsPatchFile = JsPatchFile;
//# sourceMappingURL=PatchFile.js.map