# CONTEXT for AI — Implementation and Verification of the CodeCanvas Extension

**Purpose:**
This document provides clear, step-by-step context and acceptance criteria for an automated agent (AI) or developer to implement and maintain the background logic of the CodeCanvas extension. It is designed to guide development by outlining the architecture, desired functionality, and verification steps.



### Desired Functional Scope:

- **Apply Backgrounds**: Apply custom images or CSS to four key VS Code areas: `editor`, `sidebar` (the main one), `panel` (terminal, output), and `secondaryView` (the secondary sidebar).
- **Fullscreen Mode**: Implement a global `fullscreen` mode that overrides per-area settings to apply a single wallpaper across the entire window.
- **Image Carousel**: Support multiple images for any area, with an optional `interval`-based rotation and `random` ordering.
- **Flexible Styling**: Allow CSS styles to be configured per area (e.g., `opacity`, `background-size`, `background-position`).
- **Automatic Theme Integration**: Dynamically detect `backgroundConfig` in the active theme's JSON file and apply the settings automatically when the theme is selected.

---

### Relevant Files (Starting Points):

- `src/extension.ts`: The main extension entry point. Handles command registration and activation.
- `src/background/Background.ts`: Contains the `BackgroundManager` class, which orchestrates all background-related logic. This is the central control unit.
- `src/background/PatchGenerator.ts`: The core of the styling logic. It generates the JavaScript and CSS code that gets injected into VS Code.
- `src/background/PatchFile.ts`: Manages the physical file patching of `workbench.desktop.main.js`. Handles reading, writing, restoring backups, and requesting elevated permissions.
- `src/theme-integration.ts`: Implements the logic to detect and apply background configurations from the active VS Code theme.
- `src/utils/`: Contains helper modules for constants, path resolution, and other utilities.
- `CONFIG.md`, `README.md`: Key documentation files that must be updated to reflect any functional changes.

---

### Rules and Constraints:

- **Architectural Integrity**: New code should follow the existing architectural patterns in `src/background/`, which favor small, testable functions with clear types.
- **Reversibility**: The extension must never permanently break VS Code. The `CodeCanvas: Uninstall Patch` command must be a reliable way to revert all changes.

---

### Detailed Steps (Recommended Order for Implementation/Verification):

**1. Inspection and Design**
   - **Analyze `PatchFile.ts` and `PatchGenerator.ts`**: Understand how the current implementation injects CSS and JS, manages different background types (fullscreen, editor, sidebar, etc.), and handles image URLs.
   - **Review `BackgroundManager`**: Study `src/background/Background.ts` to understand how it orchestrates the patching process, handles configuration changes, and exposes its API.

**2. Basic Implementation (Covered)**
   - The current implementation in `BackgroundManager` already reads from `codecanvas.ui` and applies patches for all target areas. The task is to maintain or extend this.

**3. Theme Integration (The "Smart" Part)**
   - **Goal**: Instead of statically mapping themes, the extension should react to theme changes in real-time.
   - **Implementation (`theme-integration.ts`)**:
     - On activation and on `workbench.colorTheme` change, get the current theme name.
     - Use `vscode.extensions.all` to find the extension that contributes the active theme.
     - Construct the full path to the theme's `.json` file.
     - Read the file using `vscode.workspace.fs`.
     - Check for a `backgroundConfig` property within the theme's JSON.
     - If it exists, update the `codecanvas.ui.background` configuration section with its content. This will trigger the `onConfigChange` listener in `BackgroundManager`, prompting the user to reload.

**4. Commands and Safety**
   - Ensure the following commands are implemented and functional:
     - `CodeCanvas: Install / Enable`: Enables the `codecanvas.enabled` setting and triggers an install/reload prompt.
     - `CodeCanvas: Disable`: Disables the `codecanvas.enabled` setting and triggers an uninstall/reload prompt.
     - `CodeCanvas: Uninstall Patch`: Directly calls the `uninstall()` method to revert all file changes.
     - `CodeCanvas: Info`: Reports whether the workbench file is currently patched.
   - The `uninstall` logic must be robust enough to clean up any modifications made by the extension.

**5. Tests and Linting**
   - Add/update unit tests in the `src/test/` directory to cover any new logic (e.g., config validation, new `PatchGenerator` features).
   - Run `npm run lint` and `npm run check-types` to ensure the code adheres to project standards.

---

### Acceptance Criteria (Minimum Viable):

1. The extension successfully applies backgrounds to the `editor`, `sidebar`, `panel`, and `secondaryView` when configured in `settings.json`.
2. Fullscreen mode correctly overrides per-area backgrounds and displays a single, global wallpaper.
3. The `CodeCanvas: Uninstall Patch` command reliably removes all file modifications and restores VS Code to its original state.
4. The extension automatically detects and applies `backgroundConfig` from the active theme file upon theme change.
5. The patching process handles file permission errors gracefully by prompting for administrative privileges.

---

### Review Checklist Before Marking Done:

- [ ] Unit tests cover all critical functions.
- [ ] `npm run lint` and `npm run check-types` pass without errors.
- [ ] The `Uninstall Patch` command has been tested and verified to restore the workbench file.
- [ ] Documentation (`README.md`, `CONFIG.md`) is updated to reflect all features and configuration options.
- [ ] The `CONTEXT.md` file itself is updated if the core architecture or development process changes.

---
*Version: 2026-01-08 — Updated for CodeCanvas 1.0*