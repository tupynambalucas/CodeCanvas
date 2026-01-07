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
exports.vscodePath = exports.VscodePath = void 0;
const path_1 = __importDefault(require("path"));
const vscode = __importStar(require("vscode"));
class VscodePath {
    /**
     * VSCode Installation Root Directory
     */
    extRoot;
    /**
     * Path to the main VSCode workbench.js file
     */
    workbenchPath;
    /**
     * Path to the JavaScript file that will be patched
     */
    jsPath;
    /**
     * Path to the CSS file (deprecated for direct patching, but might be referenced)
     */
    cssPath;
    constructor() {
        const appRoot = path_1.default.dirname(require.main.filename);
        this.extRoot = vscode.extensions.getExtension('tupyn.codecanvas').extensionPath;
        // Determine workbench path based on OS
        if (process.platform === 'win32') {
            // Adjust for Windows to target the correct path for workbench.js
            this.workbenchPath = path_1.default.join(appRoot, 'vs', 'workbench', 'workbench.desktop.main.js');
        }
        else if (process.platform === 'darwin') {
            // Adjust for macOS
            this.workbenchPath = path_1.default.join(appRoot, '..', 'Resources', 'app', 'out', // Assuming it's in out folder, verify if necessary
            'vs', 'workbench', 'workbench.desktop.main.js');
        }
        else {
            // Default for Linux
            this.workbenchPath = path_1.default.join(appRoot, 'vs', 'workbench', 'workbench.desktop.main.js');
        }
        // The actual file we will patch, it contains all js and css of vscode
        this.jsPath = this.workbenchPath;
        // In the original vscode-background, cssPath was used, but it's deprecated now.
        // Keeping it for consistency if it's referenced elsewhere, but not actively used for patching.
        this.cssPath = path_1.default.join(appRoot, 'vs', 'workbench', 'workbench.desktop.main.css'); // Placeholder
    }
}
exports.VscodePath = VscodePath;
exports.vscodePath = new VscodePath();
//# sourceMappingURL=vscodePath.js.map