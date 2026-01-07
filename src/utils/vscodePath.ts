import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

export class VscodePath {
    /**
     * VSCode Installation Root Directory
     */
    public extRoot: string;

    /**
     * Path to the main VSCode workbench.js file
     */
    public workbenchPath: string;

    /**
     * Path to the JavaScript file that will be patched
     */
    public jsPath: string;

    /**
     * Path to the CSS file (deprecated for direct patching, but might be referenced)
     */
    public cssPath: string;

    constructor() {
        const appRoot = path.dirname(require.main!.filename);
        this.extRoot = vscode.extensions.getExtension('tupyn.codecanvas')!.extensionPath;

        // Determine workbench path based on OS
        if (process.platform === 'win32') {
            // Adjust for Windows to target the correct path for workbench.js
            this.workbenchPath = path.join(appRoot, 'vs', 'workbench', 'workbench.desktop.main.js');
        } else if (process.platform === 'darwin') {
            // Adjust for macOS
            this.workbenchPath = path.join(
                appRoot,
                '..',
                'Resources',
                'app',
                'out', // Assuming it's in out folder, verify if necessary
                'vs',
                'workbench',
                'workbench.desktop.main.js'
            );
        } else {
            // Default for Linux
            this.workbenchPath = path.join(
                appRoot,
                'vs',
                'workbench',
                'workbench.desktop.main.js'
            );
        }

        // The actual file we will patch, it contains all js and css of vscode
        this.jsPath = this.workbenchPath;
        // In the original vscode-background, cssPath was used, but it's deprecated now.
        // Keeping it for consistency if it's referenced elsewhere, but not actively used for patching.
        this.cssPath = path.join(appRoot, 'vs', 'workbench', 'workbench.desktop.main.css'); // Placeholder
    }
}

export const vscodePath = new VscodePath();