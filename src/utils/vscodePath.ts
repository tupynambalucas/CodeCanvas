import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

export class VscodePath {
  public extRoot: string;
  public workbenchPath: string;
  public jsPath: string;
  public cssPath: string;

  constructor() {
    // Usa a API oficial para pegar a raiz do VS Code/Cursor
    const appRoot = vscode.env.appRoot;

    // CORREÇÃO: O ID deve ser "publisher.name".
    // Se você não definiu publisher, o VS Code usa "undefined_publisher" por padrão.
    const extensionId = 'tupynambalucasdev.codecanvas';
    const extension = vscode.extensions.getExtension(extensionId);

    this.extRoot = extension ? extension.extensionPath : '';

    // Caminho para o arquivo principal do workbench
    this.workbenchPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');

    // Se o arquivo não existir no caminho acima (comum no Cursor/Windows), tenta o caminho alternativo
    if (!fs.existsSync(this.workbenchPath)) {
      this.workbenchPath = path.join(appRoot, 'vs', 'workbench', 'workbench.desktop.main.js');
    }

    this.jsPath = this.workbenchPath;
    this.cssPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.css');
  }
}

export const vscodePath = new VscodePath();
