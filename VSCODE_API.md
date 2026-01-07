L1:# VS Code API — Focused reference for CodeCanvas
L2:
L3:This document provides a practical view and examples of the Visual Studio Code API specifically oriented to implementing and maintaining the **CodeCanvas** extension (see `CONTEXT.md`, `CONFIG.md` and `README.md`). The goal is to gather the most relevant APIs for:
L4:
L5:- Registering commands (Install/Enable, Disable, Uninstall Patch, Info).
L6:- Working with centralized configuration (`workspace.getConfiguration` / `codecanvas.ui`).
L7:- Reading and modifying files (e.g. applying safe patches using `workspace.fs`).
L8:- Detecting and processing theme files (`*.theme.json`) in `src/themes/custom/`.
L9:- Showing messages, progress and notifications to the user.
L10:- Ensuring cleanup and rollback using `Disposable` and `deactivate`.
L11:
L12:> Security note
L13:
L14:CodeCanvas modifies (or patches) editor files to inject backgrounds. Use `workspace.fs` carefully and always implement backups and rollback strategies (see "Safe rollback" section below).
L15:
L16:## Importing the `vscode` module
L17:
L18:Use the main namespace:
L19:
L20:`typescript
L21:import * as vscode from 'vscode';
L22:`
L23:
L24:## Extension basic structure
L25:
L26:`typescript
L27:export function activate(context: vscode.ExtensionContext) {
L28:  // register commands, listeners and resources
L29:}
L30:
L31:export function deactivate() {
L32:  // cleanup when needed
L33:}
L34:`
L35:
L36:Add disposable resources to `context.subscriptions` to ensure automatic cleanup.
L37:
L38:## Commands and registration
L39:
L40:Register commands that match the `commands` section in `package.json`. Example relevant to CodeCanvas:
L41:
L42:`typescript
L43:context.subscriptions.push(
L44:  vscode.commands.registerCommand('codecanvas.install', async () => { /* install patches */ })
L45:);
L46:context.subscriptions.push(
L47:  vscode.commands.registerCommand('codecanvas.uninstallPatch', async () => { /* revert changes */ })
L48:);
L49:`
L50:
L51:You can receive arguments when a command is invoked (useful for context actions).
L52:
L53:## Configuration: `workspace.getConfiguration`
L54:
L55:Read and observe centralized configuration under `codecanvas.ui`:
L56:
L57:`typescript
L58:const cfg = vscode.workspace.getConfiguration('codecanvas');
L59:const ui = cfg.get('ui') as any; // prefer type-safe parsing in production
L60:`
L61:
L62:Register a listener for changes:
L63:
L64:`typescript
L65:vscode.workspace.onDidChangeConfiguration((e) => {
L66:  if (e.affectsConfiguration('codecanvas.ui')) {
L67:    // re-apply backgrounds according to new settings
L68:  }
L69:});
L70:`
L71:
L72:## File system: `vscode.workspace.fs`
L73:
L74:Use `workspace.fs` instead of Node's `fs` wherever possible — it works with remote file systems (SSH/WSL) and integrates with VS Code.
L75:
L76:Example: reading a theme JSON file and parsing safely:
L77:
L78:`typescript
L79:import * as path from 'path';
L80:
L81:async function readThemeJson(uri: vscode.Uri) {
L82:  const data = await vscode.workspace.fs.readFile(uri);
L83:  const text = Buffer.from(data).toString('utf8');
L84:  return JSON.parse(text);
L85:}
L86:`
L87:
L88:Example: write a backup and apply a patch (recommended flow)
L89:
L90:`typescript
L91:async function safeWrite(uri: vscode.Uri, content: string) {
L92:  const backupUri = uri.with({ path: uri.path + '.codecanvas.bak' });
L93:  // create backup (if not exists)
L94:  try {
L95:    await vscode.workspace.fs.stat(backupUri);
L96:  } catch {
L97:    await vscode.workspace.fs.writeFile(backupUri, Buffer.from((await vscode.workspace.fs.readFile(uri)).toString('utf8'), 'utf8'));
L98:  }
L99:  // write new content
L100:  await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
L101:}
L102:`
L103:
L104:## URIs and paths
L105:
L106:Create URIs with `vscode.Uri.file` for local paths or `vscode.Uri.parse` for `file://`/`https://`.
L107:
L108:`typescript
L109:const uri = vscode.Uri.file(path.join(context.extensionPath, 'src', 'themes', 'custom', 'my-theme.theme.json'));
L110:`
L111:
L112:## Working with themes (`*.theme.json`)
L113:
L114:Suggested flow to detect `backgroundConfig` in `src/themes/custom/`:
L115:
L116:`typescript
L117:import * as glob from 'glob';
L118:
L119:function listThemeFiles(rootPath: string) {
L120:  return glob.sync('src/themes/custom/**/*.theme.json', { cwd: rootPath, absolute: true });
L121:}
L122:
L123:async function scanThemesForBackground(rootPath: string) {
L124:  const files = listThemeFiles(rootPath);
L125:  const result = [];
L126:  for (const f of files) {
L127:    const uri = vscode.Uri.file(f);
L128:    const theme = await readThemeJson(uri);
L129:    if (theme.backgroundConfig) {
L130:      result.push({ path: f, backgroundConfig: theme.backgroundConfig });
L131:    }
L132:  }
L133:  return result;
L134:}
L135:`
L136:
L137:Use this output to update contributions (`package.json`) or to automatically load background settings.
L138:
L139:## UI: `window` and notifications
L140:
L141:Use `vscode.window.showInformationMessage`, `showWarningMessage`, and `showErrorMessage` for user feedback.
L142:
L143:`typescript
L144:vscode.window.showInformationMessage('CodeCanvas: Background applied successfully.');
L145:vscode.window.showErrorMessage('CodeCanvas: Failed to load background image.');
L146:`
L147:
L148:For long operations (e.g. applying patches to multiple files) use `withProgress`:
L149:
L150:`typescript
L151:await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'CodeCanvas: Applying patches' }, async (progress) => {
L152:  progress.report({ message: 'Creating backups' });
L153:  // ... work ...
L154:});
L155:`
L156:
L157:## Safe rollback
L158:
L159:Key recommendations:
L160:
L161:- Always create a backup before overwriting files (e.g. `.codecanvas.bak`).
L162:- Verify backup integrity before deleting it (and provide UI to let the user restore it).
L163:- Implement a `codecanvas.uninstallPatch` command that restores all backups.
L164:
L165:Simple restore example:
L166:
L167:`typescript
L168:async function restoreBackup(uri: vscode.Uri) {
L169:  const backupUri = uri.with({ path: uri.path + '.codecanvas.bak' });
L170:  try {
L171:    const data = await vscode.workspace.fs.readFile(backupUri);
L172:    await vscode.workspace.fs.writeFile(uri, data);
L173:    await vscode.workspace.fs.delete(backupUri);
L174:  } catch (err) {
L175:    vscode.window.showErrorMessage('Failed to restore backup: ' + String(err));
L176:  }
L177:}
L178:`
L179:
L180:## Disposable and cleanup
L181:
L182:Register listeners and resources in `context.subscriptions`:
L183:
L184:`typescript
L185:context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(...));
L186:context.subscriptions.push(vscode.commands.registerCommand(...));
L187:`
L188:
L189:## Best practices specific to CodeCanvas
L190:
L191:- Do not modify files outside the project scope without explicit user confirmation.
L192:- Use `workspace.fs` for remote compatibility.
L193:- When manipulating checksums or patches, log actions to `console` and present friendly messages to the user.
L194:- Test the `Uninstall Patch` command in isolated environments before publishing.
L195:
L196:## Example: BackgroundManager (skeleton)
L197:
L198:`typescript
L199:export interface BackgroundConfig {
L200:  images?: string[];
L201:  carousel?: { interval?: number; random?: boolean };
L202:  style?: Record<string, string>;
L203:}
L204:
L205:export class BackgroundManager {
L206:  constructor(private context: vscode.ExtensionContext) {}
L207:
L208:  async apply(area: 'editor' | 'sidebar' | 'panel' | 'secondaryView', cfg: BackgroundConfig) {
L209:    // implement injection/removal of CSS or file patch manipulation
L210:  }
L211:
L212:  async remove(area: string) { /* ... */ }
L213:  async applyFullscreen(cfg: BackgroundConfig) { /* ... */ }
L214:  async restoreAll() { /* ... */ }
L215:}
L216:`
L217:
L218:## Official references
L219:
L220:Refer to the official VS Code documentation for details and examples:
L221:
L222:- `API Reference`: `https://code.visualstudio.com/api`
L223:- `workspace.fs`: `https://code.visualstudio.com/api/references/vscode-api#workspace.fs`
L224:- `commands`: `https://code.visualstudio.com/api/references/vscode-api#commands`
L225:- `workspace.getConfiguration`: `https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration`
L226:
L227:---
L228:Version: 2026-01-07 — created for CodeCanvas.
