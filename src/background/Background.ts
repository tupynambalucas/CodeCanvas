import * as vscode from 'vscode';
import * as fs from 'fs';
import { JsPatchFile } from './PatchFile';
import { PatchGenerator, TPatchGeneratorConfig } from './PatchGenerator';
import { vscodePath } from '../utils/vscodePath';
import { vsHelp } from '../utils/vsHelp';
import { ENCODING, EXTENSION_NAME, TOUCH_FILE_PATH } from '../utils/constants';

/**
 * Background configuration interface passed via API or Themes
 */
export interface BackgroundConfig {
  images?: string[];
  interval?: number;
  random?: boolean;
  opacity?: number;
  size?: 'cover' | 'contain' | string;
  position?: string;
  style?: Record<string, string>;
  useFront?: boolean; // Specific to the editor
}

export class BackgroundManager implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  private jsFile: JsPatchFile;

  constructor(private context: vscode.ExtensionContext) {
    this.jsFile = new JsPatchFile(vscodePath.jsPath);

    this.checkFirstload();
    this.registerListeners();
  }

  /**
   * Retrieves the unified CodeCanvas configuration
   */
  private get config(): TPatchGeneratorConfig {
    const cfg = vscode.workspace.getConfiguration(EXTENSION_NAME);
    const ui = cfg.get('ui') || {};

    // Legacy property mapping for backward compatibility
    const legacyConfig = {
      useFront: cfg.get('useFront'),
      style: cfg.get('style'),
      styles: cfg.get('styles'),
      customImages: cfg.get('customImages'),
      interval: cfg.get('interval'),
    };

    return {
      enabled: cfg.get('enabled', true),
      ...(ui as object),
      ...legacyConfig,
    } as TPatchGeneratorConfig;
  }

  private async checkFirstload(): Promise<boolean> {
    const firstLoad = !fs.existsSync(TOUCH_FILE_PATH);
    if (firstLoad) {
      await fs.promises.writeFile(TOUCH_FILE_PATH, vscodePath.jsPath, ENCODING);
      return true;
    }
    return false;
  }

  /**
   * Triggered when any relevant configuration changes.
   * Prompts user to reload window to apply patch.
   */
  private async onConfigChange() {
    const hasInstalled = await this.hasInstalled();
    const enabled = this.config.enabled;

    if (!enabled) {
      if (hasInstalled) {
        vsHelp.reload({
          message: `CodeCanvas: Os fundos serão desativados.`,
          btnReload: 'Desativar e Recarregar',
          beforeReload: () => this.uninstall(),
        });
      }
      return;
    }

    vsHelp.reload({
      message: `CodeCanvas: Configuração alterada. Clique para aplicar as mudanças.`,
      btnReload: 'Aplicar e Recarregar',
      beforeReload: () => this.install(),
    });
  }

  private registerListeners() {
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(async (ex) => {
        const affectsCodeCanvas = ex.affectsConfiguration(EXTENSION_NAME);
        const affectsTheme = ex.affectsConfiguration('workbench.colorTheme');

        if (affectsCodeCanvas || affectsTheme) {
          this.onConfigChange();
        }
      }),
    );
  }

  /**
   * Generates and applies the JS/CSS patch to VS Code internal files
   */
  async install(): Promise<boolean> {
    const scriptContent = PatchGenerator.create(this.config);
    const success = await this.jsFile.applyPatches(scriptContent);

    if (success) {
      vscode.window.showInformationMessage('CodeCanvas: Patch aplicado com sucesso.');
    } else {
      vscode.window.showErrorMessage(
        'CodeCanvas: Falha ao aplicar patch. Verifique permissões de administrador.',
      );
    }
    return success;
  }

  /**
   * Removes all modifications and restores the original file
   */
  async uninstall(): Promise<boolean> {
    const success = await this.jsFile.restore();
    if (success) {
      vscode.window.showInformationMessage('CodeCanvas: Patch removido com sucesso.');
    }
    return success;
  }

  async hasInstalled(): Promise<boolean> {
    return this.jsFile.hasPatched();
  }

  /**
   * API: Applies background to a specific area
   */
  async apply(area: 'editor' | 'sidebar' | 'panel' | 'secondaryView', cfg: BackgroundConfig) {
    const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
    const ui: any = config.get('ui') || {};

    // Maps 'secondaryView' to internal key 'secondarybar'
    const areaKey = area === 'secondaryView' ? 'secondarybar' : area;

    ui.background = ui.background || {};
    ui.background[areaKey] = cfg;

    // Updating 'ui' object triggers onDidChangeConfiguration listener
    await config.update('ui', ui, vscode.ConfigurationTarget.Global);
  }

  /**
   * API: Removes background from a specific area
   */
  async remove(area: string) {
    const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
    const ui: any = config.get('ui') || {};
    const areaKey = area === 'secondaryView' ? 'secondarybar' : area;

    if (ui.background && ui.background[areaKey]) {
      delete ui.background[areaKey];
      await config.update('ui', ui, vscode.ConfigurationTarget.Global);
    }
  }

  /**
   * API: Activates Fullscreen mode with provided configuration
   */
  async applyFullscreen(cfg: BackgroundConfig) {
    const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
    const ui: any = config.get('ui') || {};

    ui.fullscreen = true;
    ui.background = ui.background || {};
    ui.background.fullscreen = cfg;

    await config.update('ui', ui, vscode.ConfigurationTarget.Global);
  }

  async restoreAll(): Promise<boolean> {
    return this.uninstall();
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }
}
