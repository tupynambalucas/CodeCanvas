# CodeCanvas — Custom Themes for VS Code

![Logo](images/logo.png)

An extension for Visual Studio Code that provides custom themes integrated with an intelligent background system. Developed as an evolution of the `vscode-background` extension, with a focus on a unified and automated experience.

Note: This repository includes `CONTEXT.md` — a guidance document for automated agents (AI) with step-by-step instructions for implementing, verifying, and reporting progress on the background logic. It also includes `VSCODE_API.md`, a practical VS Code API reference tailored to CodeCanvas (examples for `workspace.fs`, command registration, and safe patching practices). See `CONTEXT.md` and `VSCODE_API.md` for recommended steps, acceptance criteria and when the automated agent should request human confirmation before making critical changes.

## ✨ What is CodeCanvas

CodeCanvas combines elegant visual themes with automatic background settings to create a visually cohesive and customizable development experience. Each theme includes not only colors but also optimized background settings for different UI areas.

## 🎨 Available Themes

### Dark Purple Theme

- **Name**: `tdev.dark.purple`
- **Type**: Dark theme
- **Palette**: Elegant purple with magenta highlights
- **Features**:
 - Dark interface optimized for long coding sessions
 - Appropriate contrast to reduce eye strain
 - Integrated background settings
 - Sidebar and panel with complementary tones

### Theme System

## 🚀 Installation and Usage

### Prerequisites

- Visual Studio Code ^1.107.0
- Node.js (for local development)

### Installation

`bash
# Clone the repository
git clone https://github.com/tupynambalucas/CodeCanvas.git
cd CodeCanvas

# Install dependencies
npm install

# Build the extension
npm run compile
`

### How to Use

1. **Extension installation**:

 - Press `F5` in VS Code to open a new window with the extension loaded
 - Or build and install the `.vsix` file manually

2. **Selecting a theme**:

 - Open the Command Palette (`Ctrl+Shift+P`)
 - Type "Color Theme" and select
 - Choose "tdev.dark.purple" from the available themes

3. **Unified configuration**:
CodeCanvas uses a centralized configuration. Add the following to your `settings.json`:

```json
{
  "codecanvas.enabled": true, // Enable/disable CodeCanvas
  "codecanvas.ui": {
    "theme": "tdev.dark.purple",
    "fullscreen": false,
    "background": {
      "editor": {
        "images": ["file:///path/to/image.jpg"],
        "style": { "opacity": "0.3" }
      },
      "sidebar": { "images": [], "style": {} },
      "panel": { "images": [], "style": {} }
    }
  }
}
```

### Fullscreen mode

To apply a single background across the entire VS Code window:

```json
{
  "codecanvas.ui": {
    "fullscreen": true,
    "background": {
      "images": ["file:///path/to/fullscreen-bg.jpg"],
      "style": {
        "background-size": "cover",
        "opacity": "0.2"
      }
    }
  }
}
```

### Automatic theme system

CodeCanvas includes an automatic update system:

`bash
# Automatically update theme contributions
node scripts/update-contributions.mjs
`

This script:

- Detects new themes in `src/themes/custom/`
- Updates `package.json` with new contributions
- Registers themes that include integrated background configuration

## 🎯 Commands and Actions

### Available commands (Ctrl+Shift+P)

- `CodeCanvas: Info` - Shows information about the current configuration
- `CodeCanvas: Install / Enable` - Installs/enables the background patches
- `CodeCanvas: Disable` - Temporarily disables backgrounds
- `CodeCanvas: Uninstall Patch` - Completely removes CodeCanvas patches
- `CodeCanvas: Show All Commands` - Lists all available commands

## 🏗️ Project Structure

`
CodeCanvas/
├── vscode-background-master/     # Reference base extension
├── src/                         # Source code for CodeCanvas extension
│   ├── extension.ts            # Entry point and unified logic
│   ├── theme-integration.ts    # Theme-background integration
│   ├── background/             # CSS application logic
│   ├── themes/                 # Theme system
│   │   ├── custom/             # Custom themes
│   │   └── defaults/           # Default assets
│   └── test/                   # Tests
├── scripts/                    # Automation scripts
└── package.json                # Main configuration
`

## 🔧 Development

### Theme system

#### Creating a new theme

1. **Add a theme file** under `src/themes/custom/`:

`json
{
  "$schema": "vscode://schemas/color-theme",
  "name": "my-custom-theme",
  "type": "dark",
  "include": "../defaults/themes/dark_default.json",
  "colors": {
    "editor.background": "#1a1a1a",
    "sideBar.background": "#1a1a1a"
  },
  "backgroundConfig": {
    "editor": {
      "useFront": true,
      "style": {
        "background-size": "cover",
        "opacity": "0.1"
      }
    }
  }
}
`

2. **Run the update script**:

`bash
node scripts/update-contributions.mjs
`

3. **Recompile the extension**:

`bash
npm run compile
`

### Development commands

```bash

# Install and setup

npm install

# TypeScript build

npm run compile

# Update themes

node scripts/update-contributions.mjs

# Tests

npm run test

# Production build

npm run package

```

## 🤝 Contributing

### Adding new themes

1. **Create a theme file** under `src/themes/custom/` following the existing pattern
2. **Include `backgroundConfig`** (optional) to enable automatic background integration
3. **Run the update script** to register the theme automatically
4. **Test the integration** with `F5` in VS Code

### Guidelines

- Keep visual consistency with existing themes
- Document colors and the theme purpose
- Test on different operating systems
- Follow naming conventions (`tdev.[name].[variant]`)

## 📝 Available scripts

```json
{
  "scripts": {
    "vscode:prepublish": "npm run package",
    "compile": "npm run check-types && npm run lint && node esbuild.js",
    "watch": "npm-run-all -p watch:*",
    "package": "npm run check-types && npm run lint && node esbuild.js --production",
    "check-types": "tsc --noEmit",
    "lint": "eslint src",
    "test": "vscode-test"
  }
}
```

## 📋 Current roadmap

- ✅ Basic theme system implemented
- ✅ Automatic update script functional
- ✅ Unified configuration system (CodeCanvas UI)
- ✅ Fullscreen mode implemented
- ✅ Carousel and validations
- ✅ Theme integration
- ✅ Commands and safety
- 🔄 Visual management interface
- 📋 More preconfigured themes

## 👨‍💻 Author

**Tupynambá Lucas**

- GitHub: [@tupynambalucas](https://github.com/tupynambalucas)
- Based on the extension: [vscode-background](https://github.com/shalldie/vscode-background)

## 📄 License

MIT License - See the [LICENSE](LICENSE) file for details.

---

**Note**: This project is actively under development. Some features may be incomplete or experimental.