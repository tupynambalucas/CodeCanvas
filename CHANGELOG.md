# Change Log

All notable changes to the "CodeCanvas" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2026-01-08

### Added

- **Unified Background System**: Centralized configuration under `codecanvas.ui` for a streamlined user experience.
- **Fullscreen Mode**: Apply a single global background to the entire VS Code window.
- **Sectioned Mode**: Configure different backgrounds for `editor`, `sidebar`, `panel`, and the newly added `secondarybar` (Secondary View).
- **Image Carousel**: Support for multiple images with interval-based rotation and random order.
- **Theme Integration**: Themes can now include a `backgroundConfig` key to provide their own default background settings, which are applied automatically when the theme is selected.
- **Commands**: Added a full suite of commands for managing the extension:
  - `CodeCanvas: Install / Enable`: Installs or enables the background patches.
  - `CodeCanvas: Uninstall Patch`: Safely removes all modifications.
  - `CodeCanvas: Disable`: Temporarily disables backgrounds without uninstalling.
  - `CodeCanvas: Info`: Checks if the patch is currently installed.
- **Secondary View Support**: Added background support for the secondary side bar (config key: `secondarybar`).

### Changed

- **Patching Mechanism**: Improved the file patching logic to be more reliable and to handle administrator permissions gracefully using `sudo-prompt`.
- **Configuration**: Migrated from multiple individual settings to a single `codecanvas.ui` object for all UI-related configurations.

### Fixed

- **Checksum Warning**: Implemented a patch to hide the "Your Code installation appears to be corrupt" warning that appears after modifying the workbench file.
- **Path Handling**: Improved logic for resolving VS Code's internal file paths across different platforms and versions (including Cursor).

## [Unreleased]

### DOC

- Improved and clarified documentation across `README.md`, `CONFIG.md`, `CONTEXT.md`, and `VSCODE_API.md` to ensure consistency and accuracy, especially regarding the `secondarybar` vs `secondaryView` naming convention.

- Initial release
