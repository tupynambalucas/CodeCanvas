# VS Code API — Focused Reference for CodeCanvas

This document provides a practical, focused guide to the Visual Studio Code API for developing and maintaining the **CodeCanvas** extension. It highlights the most relevant APIs for key functionalities.

> **Security Note**: CodeCanvas modifies (patches) a core VS Code file to inject backgrounds. This requires care. Always use the `workspace.fs` API for file operations and implement reliable backup and rollback strategies.

## 1. Extension Lifecycle

The extension entry points are standard for VS Code. Use `context.subscriptions` to register disposables for automatic cleanup.

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Register commands, listeners, and other resources here
  const backgroundManager = new BackgroundManager(context);
  context.subscriptions.push(backgroundManager);
}

export function deactivate() {
  // Cleanup logic (if any) when the extension is deactivated
}
```

## 2. Commands and Registration

Register commands in `activate` that are declared in `package.json`.

```typescript
// From src/extension.ts
context.subscriptions.push(
  vscode.commands.registerCommand('codecanvas.install', async () => {
    // Logic to enable and apply the patch
  })
);

context.subscriptions.push(
  vscode.commands.registerCommand('codecanvas.uninstallPatch', async () => {
    // Logic to safely remove the patch and restore original files
  })
);
```

## 3. Configuration (`workspace.getConfiguration`)

All user settings are stored under the `codecanvas` key. The core configuration object is `codecanvas.ui`.

**Reading Configuration:**
```typescript
const config = vscode.workspace.getConfiguration('codecanvas');
const enabled = config.get<boolean>('enabled');
const uiConfig = config.get('ui'); // This will contain fullscreen, background, etc.
```

**Listening for Changes:**
The extension must react to changes in its own settings or the active theme.
```typescript
// From src/background/Background.ts
vscode.workspace.onDidChangeConfiguration(async (e) => {
  const affectsCodeCanvas = e.affectsConfiguration('codecanvas');
  const affectsTheme = e.affectsConfiguration('workbench.colorTheme');

  if (affectsCodeCanvas || affectsTheme) {
    // Logic to prompt for a reload or apply changes
  }
});
```

## 4. File System (`workspace.fs`)

Always use `workspace.fs` over Node's `fs` for file operations. It is asynchronous and compatible with remote workspaces (WSL, SSH). The patching mechanism relies heavily on it.

**Example: Safe File Writing with Backup and Sudo Fallback**
`PatchFile.ts` implements a robust system for writing to the workbench JS file, which often requires elevated permissions.

- It first attempts a standard write.
- If that fails due to permissions, it prompts the user to retry with admin/sudo privileges.
- It uses `@vscode/sudo-prompt` to execute a file move/copy command with elevation.
- Backups are managed implicitly by the patcher logic, which cleans up after itself.

```typescript
// Simplified concept from src/background/PatchFile.ts

async function safeWriteWithSudo(targetPath: string, content: string) {
  try {
    // Attempt direct write
    await vscode.workspace.fs.writeFile(vscode.Uri.file(targetPath), Buffer.from(content, 'utf8'));
  } catch (error) {
    // If permission denied, fall back to using sudo-prompt
    const useSudo = await vscode.window.showWarningMessage(
      'Permission denied. Retry with admin privileges?',
      { modal: true },
      'Yes'
    );
    if (useSudo === 'Yes') {
      // Logic to write to a temp file and use sudo to move it to the target
    }
  }
}
```

## 5. Automatic Theme Integration

A key feature of CodeCanvas is its ability to automatically use backgrounds provided by a theme. This is achieved by scanning installed extensions, not just local project files.

**Example: Finding the Active Theme and its Configuration**
This snippet is based on the logic in `src/theme-integration.ts`.

```typescript
import * as vscode from 'vscode';
import * as path from 'path';

async function detectAndApplyThemeBackground() {
  const currentThemeName = vscode.workspace.getConfiguration('workbench').get('colorTheme');
  if (!currentThemeName) return;

  // 1. Find the theme contribution from all installed extensions
  const themeExtension = vscode.extensions.all.find(ext => 
    (ext.packageJSON.contributes?.themes || []).some((t: any) => t.label === currentThemeName || t.id === currentThemeName)
  );

  if (!themeExtension) return;

  const themeContribute = themeExtension.packageJSON.contributes.themes.find((t: any) => t.label === currentThemeName || t.id === currentThemeName);
  
  // 2. Construct the full path to the theme's JSON file
  const themePath = path.join(themeExtension.extensionPath, themeContribute.path);
  
  // 3. Read the file and check for `backgroundConfig`
  try {
    const themeUri = vscode.Uri.file(themePath);
    const content = await vscode.workspace.fs.readFile(themeUri);
    const themeJson = JSON.parse(content.toString());

    if (themeJson.backgroundConfig) {
      // 4. If found, update the CodeCanvas configuration
      const codeCanvasConfig = vscode.workspace.getConfiguration('codecanvas');
      const ui = codeCanvasConfig.get('ui') || {};
      ui.background = themeJson.backgroundConfig;
      await codeCanvasConfig.update('ui', ui, vscode.ConfigurationTarget.Global);
    }
  } catch (e) {
    console.error('CodeCanvas: Failed to read theme file.', e);
  }
}
```

## 6. API for Developers (`BackgroundManager`)

CodeCanvas exposes an API for other extensions to programmatically manage backgrounds. The `BackgroundManager` class provides the core methods.

### `BackgroundConfig` Interface

This is the primary interface for defining a background.

```typescript
export interface BackgroundConfig {
  images?: string[]; // URLs or folder paths
  random?: boolean;
  interval?: number; // In seconds
  opacity?: number;
  size?: 'cover' | 'contain' | string;
  position?: string;
  style?: Record<string, string>; // For other custom CSS
  useFront?: boolean; // Editor-only: render on top of content
}
```

### `BackgroundManager` Skeleton

This class provides the main API surface for controlling backgrounds.

```typescript
export class BackgroundManager {
  constructor(private context: vscode.ExtensionContext) {
    // ... initialization ...
  }

  // Applies a background to a specific UI area
  async apply(
    area: 'editor' | 'sidebar' | 'panel' | 'secondaryView',
    config: BackgroundConfig
  ): Promise<void> {
    // Implementation updates the 'codecanvas.ui' configuration,
    // which then triggers the patch update flow.
  }

  // Removes the background from a specific area
  async remove(area: string): Promise<void> {
    // ...
  }

  // Activates fullscreen mode with the given config
  async applyFullscreen(config: BackgroundConfig): Promise<void> {
    // ...
  }

  // Safely removes all patches and restores VS Code to its original state
  async restoreAll(): Promise<boolean> {
    // ...
  }
}
```

---
*Version: 2026-01-08 — Updated for CodeCanvas 1.0*