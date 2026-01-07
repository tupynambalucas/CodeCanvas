L1:# CONTEXT for AI — Implementation and Verification of the CodeCanvas extension
L2:
L3:Purpose:
L4:The purpose of this document is to provide clear, step-by-step context and acceptance criteria for an automated agent (AI) or developer to implement the background logic of the CodeCanvas extension. Use the `vscode-background` reference (`vscode-background-master/`) only for inspection — DO NOT copy code verbatim; adapt to CodeCanvas architecture.
L5:
L6:Desired functional scope:
L7:
L8:- Apply a background (image/CSS) to the following VS Code areas: `editor`, `sidebar` (main sidebar), `panel` (terminal/output), and `secondaryView` (secondary sidebar when applicable).
L9:- Implement a `fullscreen` mode that ignores sub-views and applies a global wallpaper.
L10:- Support multiple images with an optional `carousel` (interval-based rotation, optional random order).
L11:- Allow CSS styles per area (e.g. `opacity`, `background-size`, `background-position`).
L12:- Detect themes under `src/themes/custom/*.theme.json` that include the `backgroundConfig` key and register automatic integration.
L13:
L14:Relevant files (starting points):
L15:
L16:- `src/extension.ts` — extension entry point for CodeCanvas.
L17:- `src/themes/` — theme definitions.

- Default built-in themes: `src/themes/defaults/themes/`
- Theme templates (used for inheritance only, not contributed): `src/themes/defaults/templates/`
- Custom user themes: `src/themes/custom/`
- Look for `backgroundConfig` in `.theme.json` files.
  L18:- `src/background/` — implement injection/removal logic here (create if missing).
  L19:- `vscode-background-master/src/background/` — reference to learn patching/injection strategies.
  L20:- `package.json`, `CONFIG.md`, `README.md` — update contributions and documentation as part of implementation.
  L21:
  L22:Rules and constraints:
  L23:
  L24:- Do not modify files in `vscode-background-master` — only consult them.
  L25:- Prefer creating your own architecture in `src/background/` with testable APIs (small functions, explicit types).
  L26:- The extension must not break VS Code; always provide ways to revert changes (command `Uninstall Patch`).
  L27:
  L28:Detailed steps (recommended order):
  L29:
  L30:1. Inspection and design
  L31:
  L32: - Read `vscode-background-master/src/background/` to identify useful patterns (e.g., where CSS is injected, how checksums are computed).
  L33: - Define the local API for `BackgroundManager` in `src/background/Background.ts` (methods: `apply(area, config)`, `remove(area)`, `applyFullscreen(config)`, `restoreAll()`).
  L34:
  L35:2. Basic implementation
  L36:
  L37: - Create `src/background/Background.ts` with an initial implementation that injects a positioned `<div>` per target area.
  L38: - Support reading `codecanvas.ui` from `settings.json` and applying `editor`, `sidebar`, `panel`, `secondaryView`.
  L39:
  L40:3. Fullscreen mode
  L41:
  L42: - Implement `applyFullscreen(config)` that overlays/hides per-area backgrounds and applies a single wallpaper covering the entire window.
  L43:
  L44:4. Carousel and validations
  L45:
  L46: - Implement image rotation with `interval` (seconds) and `random`.
  L47: - Validate `file:///` paths and remote URLs and provide fallbacks when invalid.
  L48:
  L49:5. Theme integration
  L50:
  L51: - Detect `backgroundConfig` in main theme files (not templates) during `scripts/update-contributions.mjs` and register only these entries in `package.json`.
- Theme templates (stored in `src/themes/defaults/templates/`) can be included in a main theme file via the `include` property for inheritance, but are never registered or contributed directly.
  L52:
  L53:6. Commands and safety
  L54:
  L55: - Implement the commands listed in `README.md` (`Install / Enable`, `Disable`, `Uninstall Patch`, `Info`).
  L56: - Ensure `Uninstall Patch` reverts any modification safely.
  L57:
  L58:7. Tests and lint
  L59: - Add unit tests for testable parts (config validation, image selection, carousel behavior).
  L60: - Run `eslint` and `tsc --noEmit` ensuring no errors.
  L61:
  L62:Acceptance criteria (minimum viable)
  L63:
  L64:1. The extension applies backgrounds at least to `editor`, `sidebar` and `panel` when configured in `settings.json`.
  L65:2. Fullscreen mode replaces per-area backgrounds and displays a global wallpaper.
  L66:3. There is a `CodeCanvas: Uninstall Patch` command that removes changes and restores previous state.
  L67:4. The solution provides clear console logs and user-friendly errors when images fail to load.
  L68:5. No irreversible direct changes to user system files without confirmation (e.g., backups or rollback steps).
  L69:
  L70:Progress & confirmation format (how the AI should report):
  L71:
  L72:- For each step (1..7) the AI must generate a brief report with:
  L73:
  L74: - What was done (files created/modified with paths).
  L75: - Tests executed and results (pass/fail).
  L76: - Linter/type-check results.
  L77: - If human approval is needed (e.g., architectural decisions, breaking changes), list it clearly and pause for confirmation.
  L78:
  L79:- Upon finishing implementation, ask for user confirmation and provide a summary of changed files and completed tasks.
  L80:
  L81:Review checklist before marking done:
  L82:
  L83:- [ ] Unit tests cover main functions.
  L84:- [ ] Lint/type checks clean.
  L85:- [ ] `Uninstall Patch` command tests rollback.
  L86:- [ ] Documentation updated (`README.md`, `CONFIG.md`, `package.json` contributions).
  L87:
  L88:Notes for the AI developer:
  L89:
  L90:- Keep commits small and atomic if operating with VCS.
  L91:- Document important changes in commit messages and `README.md`.
  L92:- If technical uncertainty arises, ask a specific question instead of making a risky decision.
  L93:
  L94:Version of this context: 2026-01-07
