import * as vscode from 'vscode';
import * as fs from 'fs';
import { JsPatchFile } from './PatchFile';
import {
  PatchGenerator,
  TPatchGeneratorConfig,
  EditorPatchGeneratorConfig,
  FullscreenPatchGeneratorConfig,
  SidebarPatchGeneratorConfig,
  AuxiliarybarPatchGeneratorConfig,
  PanelPatchGeneratorConfig,
  LegacyEditorPatchGeneratorConfig,
} from './PatchGenerator';
import { vscodePath } from '../utils/vscodePath';
import { vsHelp } from '../utils/vsHelp';
import { ENCODING, EXTENSION_NAME, TOUCH_FILE_PATH, VERSION } from '../utils/constants';

export interface BackgroundConfig {
  images?: string[];
  carousel?: { interval?: number; random?: boolean };
  style?: Record<string, string>;
  useFront?: boolean; // Specific to editor
  // TODO: Add other properties as needed based on CONFIG.md and the reference implementation
}

export class BackgroundManager implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  private jsFile: JsPatchFile;

  constructor(private context: vscode.ExtensionContext) {
    this.jsFile = new JsPatchFile(vscodePath.jsPath);

    this.checkFirstload();
    this.registerListeners();
  }

  private get config(): TPatchGeneratorConfig {
    const cfg = vscode.workspace.getConfiguration(EXTENSION_NAME);
    const ui = cfg.get('ui') || {}; // Default to empty object if ui is undefined

    // Legacy config properties for backward compatibility
    const legacyConfig: Partial<LegacyEditorPatchGeneratorConfig> = {
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
      // Mark extension as started
      await fs.promises.writeFile(TOUCH_FILE_PATH, vscodePath.jsPath, ENCODING);
      return true;
    }

    return false;
  }

  private async onConfigChange() {
    const hasInstalled = await this.hasInstalled();
    const enabled = this.config.enabled;

    if (!enabled) {
      if (hasInstalled) {
        vsHelp.reload({
          message: `CodeCanvas: Backgrounds will be disabled.`,
          btnReload: 'Disable and Reload',
          beforeReload: () => this.uninstall(),
        });
      }
      return;
    }

    vsHelp.reload({
      message: `CodeCanvas: Configuration has been changed, click to apply.`,
      btnReload: 'Apply and Reload',
      beforeReload: () => this.install(),
    });
  }

  private registerListeners() {
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(async (ex) => {
        // AJUSTE: Agora monitoramos tanto o CodeCanvas quanto a troca de temas do VS Code
        const affectsCodeCanvas = ex.affectsConfiguration(EXTENSION_NAME);
        const affectsTheme = ex.affectsConfiguration('workbench.colorTheme');

        if (affectsCodeCanvas || affectsTheme) {
          this.onConfigChange();
        }
      }),
    );
  }

  async install(): Promise<boolean> {
    // Generate patch content based on current configuration
    const scriptContent = PatchGenerator.create(this.config);
    const success = await this.jsFile.applyPatches(scriptContent);
    if (success) {
      vscode.window.showInformationMessage('CodeCanvas: Patch applied successfully.');
    } else {
      vscode.window.showErrorMessage('CodeCanvas: Failed to apply patch.');
    }
    return success;
  }

  async uninstall(): Promise<boolean> {
    const success = await this.jsFile.restore();
    if (success) {
      vscode.window.showInformationMessage('CodeCanvas: Patch uninstalled successfully.');
    } else {
      vscode.window.showErrorMessage('CodeCanvas: Failed to uninstall patch.');
    }
    return success;
  }

  async hasInstalled(): Promise<boolean> {
    return this.jsFile.hasPatched();
  }

  async apply(area: 'editor' | 'sidebar' | 'panel' | 'secondaryView', cfg: BackgroundConfig) {
    // This method will be more complex, likely calling PatchGenerator with specific area configs
    // For now, it's a placeholder.
    vscode.window.showInformationMessage(
      `Apply background to ${area} is not yet fully implemented.`,
    );
  }

  async remove(area: string) {
    // Similar to apply, this will interact with the patching mechanism
    vscode.window.showInformationMessage(
      `Remove background from ${area} is not yet fully implemented.`,
    );
  }

  async applyFullscreen(cfg: BackgroundConfig) {
    // This will call PatchGenerator with the fullscreen config
    vscode.window.showInformationMessage(
      `Apply fullscreen background is not yet fully implemented.`,
    );
  }

  async restoreAll(): Promise<boolean> {
    return this.uninstall();
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }
}
