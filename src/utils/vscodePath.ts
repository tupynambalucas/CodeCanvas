import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

export class VscodePath {
  public extRoot: string;
  public workbenchPath: string;
  public jsPath: string;
  public cssPath: string;

  constructor() {
    // Uses official API to get VS Code/Cursor root
    const appRoot = vscode.env.appRoot;

    // FIX: ID must be "publisher.name".
    // If publisher is undefined, VS Code defaults to "undefined_publisher".
    const extensionId = 'tupynambalucasdev.codecanvas';
    const extension = vscode.extensions.getExtension(extensionId);

    this.extRoot = extension ? extension.extensionPath : '';

    // Path to main workbench file
    this.workbenchPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');

    // If file doesn't exist at path above (common in Cursor/Windows), try alternative path
    if (!fs.existsSync(this.workbenchPath)) {
      this.workbenchPath = path.join(appRoot, 'vs', 'workbench', 'workbench.desktop.main.js');
    }

    this.jsPath = this.workbenchPath;
    this.cssPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.css');
  }
}

export const vscodePath = new VscodePath();
