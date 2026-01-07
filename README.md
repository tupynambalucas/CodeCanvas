L1:# CodeCanvas — Custom Themes for VS Code
L2:
L3:![Logo](images/logo.png)
L4:
L5:An extension for Visual Studio Code that provides custom themes integrated with an intelligent background system. Developed as an evolution of the `vscode-background` extension, with a focus on a unified and automated experience.
L6:
L7:Note: This repository includes `CONTEXT.md` — a guidance document for automated agents (AI) with step-by-step instructions for implementing, verifying, and reporting progress on the background logic. It also includes `VSCODE_API.md`, a practical VS Code API reference tailored to CodeCanvas (examples for `workspace.fs`, command registration, and safe patching practices). See `CONTEXT.md` and `VSCODE_API.md` for recommended steps, acceptance criteria and when the automated agent should request human confirmation before making critical changes.
L8:
L9:## ✨ What is CodeCanvas
L10:
L11:CodeCanvas combines elegant visual themes with automatic background settings to create a visually cohesive and customizable development experience. Each theme includes not only colors but also optimized background settings for different UI areas.
L12:
L13:## 🎨 Available Themes
L14:
L15:### Dark Purple Theme
L16:
L17:- **Name**: `tdev.dark.purple`
L18:- **Type**: Dark theme
L19:- **Palette**: Elegant purple with magenta highlights
L20:- **Features**:
L21: - Dark interface optimized for long coding sessions
L22: - Appropriate contrast to reduce eye strain
L23: - Integrated background settings
L24: - Sidebar and panel with complementary tones
L25:
L26:### Theme System
L27:
L45:## 🚀 Installation and Usage
L46:
L47:### Prerequisites
L48:
L49:- Visual Studio Code ^1.107.0
L50:- Node.js (for local development)
L51:
L52:### Installation
L53:
L54:`bash
L55:# Clone the repository
L56:git clone https://github.com/tupynambalucas/CodeCanvas.git
L57:cd CodeCanvas
L58:
L59:# Install dependencies
L60:npm install
L61:
L62:# Build the extension
L63:npm run compile
L64:`
L65:
L66:### How to Use
L67:
L68:1. **Extension installation**:
L69:
L70: - Press `F5` in VS Code to open a new window with the extension loaded
L71: - Or build and install the `.vsix` file manually
L72:
L73:2. **Selecting a theme**:
L74:
L75: - Open the Command Palette (`Ctrl+Shift+P`)
L76: - Type "Color Theme" and select
L77: - Choose "tdev.dark.purple" from the available themes
L78:
L79:3. **Unified configuration**:
L80: CodeCanvas uses a centralized configuration. Add the following to your `settings.json`:
L81:
L82: `json
L83:   {
L84:     "codecanvas.enabled": true,
L85:     "codecanvas.ui": {
L86:       "theme": "tdev.dark.purple",
L87:       "fullscreen": false,
L88:       "background": {
L89:         "editor": {
L90:           "images": ["file:///path/to/image.jpg"],
L91:           "style": { "opacity": "0.3" }
L92:         },
L93:         "sidebar": { "images": [], "style": {} },
L94:         "panel": { "images": [], "style": {} }
L95:       }
L96:     }
L97:   }
L98:   `
L99:
L100:### Fullscreen mode
L101:
L102:To apply a single background across the entire VS Code window:
L103:
L104:`json
L105:{
L106:  "codecanvas.ui": {
L107:    "fullscreen": true,
L108:    "background": {
L109:      "images": ["file:///path/to/fullscreen-bg.jpg"],
L110:      "style": {
L111:        "background-size": "cover",
L112:        "opacity": "0.2"
L113:      }
L114:    }
L115:  }
L116:}
L117:`
L118:
L119:### Automatic theme system
L120:
L121:CodeCanvas includes an automatic update system:
L122:
L123:`bash
L124:# Automatically update theme contributions
L125:node scripts/update-contributions.mjs
L126:`
L127:
L128:This script:
L129:
L130:- Detects new themes in `src/themes/custom/`
L131:- Updates `package.json` with new contributions
L132:- Registers themes that include integrated background configuration
L133:
L134:## 🎯 Commands and Actions
L135:
L136:### Available commands (Ctrl+Shift+P)
L137:
L138:- `CodeCanvas: Info` - Shows information about the current configuration
L139:- `CodeCanvas: Install / Enable` - Installs/enables the background patches
L140:- `CodeCanvas: Disable` - Temporarily disables backgrounds
L141:- `CodeCanvas: Uninstall Patch` - Completely removes CodeCanvas patches
L142:- `CodeCanvas: Show All Commands` - Lists all available commands
L143:
L144:## 🏗️ Project Structure
L145:
L146:`
L147:CodeCanvas/
L148:├── vscode-background-master/     # Reference base extension
L149:├── src/                         # Source code for CodeCanvas extension
L150:│   ├── extension.ts            # Entry point and unified logic
L151:│   ├── theme-integration.ts    # Theme-background integration
L152:│   ├── background/             # CSS application logic
L153:│   ├── themes/                 # Theme system
L154:│   │   ├── custom/             # Custom themes
L155:│   │   └── defaults/           # Default assets
L156:│   └── test/                   # Tests
L157:├── scripts/                    # Automation scripts
L158:└── package.json                # Main configuration
L159:`
L160:
L161:## 🔧 Development
L162:
L163:### Theme system
L164:
L165:#### Creating a new theme
L166:
L167:1. **Add a theme file** under `src/themes/custom/`:
L168:
L169:`json
L170:{
L171:  "$schema": "vscode://schemas/color-theme",
L172:  "name": "my-custom-theme",
L173:  "type": "dark",
L174:  "include": "../defaults/themes/dark_default.json",
L175:  "colors": {
L176:    "editor.background": "#1a1a1a",
L177:    "sideBar.background": "#1a1a1a"
L178:  },
L179:  "backgroundConfig": {
L180:    "editor": {
L181:      "useFront": true,
L182:      "style": {
L183:        "background-size": "cover",
L184:        "opacity": "0.1"
L185:      }
L186:    }
L187:  }
L188:}
L189:`
L190:
L191:2. **Run the update script**:
L192:
L193:`bash
L194:node scripts/update-contributions.mjs
L195:`
L196:
L197:3. **Recompile the extension**:
L198:
L199:`bash
L200:npm run compile
L201:`
L202:
L203:### Development commands
L204:
L205:```bash

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

````
L206:
L207:## 🤝 Contributing
L208:
L209:### Adding new themes
L210:
L211:1. **Create a theme file** under `src/themes/custom/` following the existing pattern
L212:2. **Include `backgroundConfig`** (optional) to enable automatic background integration
L213:3. **Run the update script** to register the theme automatically
L214:4. **Test the integration** with `F5` in VS Code
L215:
L216:### Guidelines
L217:
L218:- Keep visual consistency with existing themes
L219:- Document colors and the theme purpose
L220:- Test on different operating systems
L221:- Follow naming conventions (`tdev.[name].[variant]`)
L222:
L223:## 📝 Available scripts
L224:
L225:```json
L226:{
L227:  "scripts": {
L228:    "vscode:prepublish": "npm run package",
L229:    "compile": "npm run check-types && npm run lint && node esbuild.js",
L230:    "watch": "npm-run-all -p watch:*",
L231:    "package": "npm run check-types && npm run lint && node esbuild.js --production",
L232:    "check-types": "tsc --noEmit",
L233:    "lint": "eslint src",
L234:    "test": "vscode-test"
L235:  }
L236:}
L237:```
L238:
L239:## 📋 Current roadmap
L240:
L241:- ✅ Basic theme system implemented
L242:- ✅ Automatic update script functional
L243:- ✅ Unified configuration system (CodeCanvas UI)
L244:- ✅ Fullscreen mode implemented
L245:- 🔄 Visual management interface
L246:- 📋 More preconfigured themes
L247:
L248:## 👨‍💻 Author
L249:
L250:**Tupynambá Lucas**
L251:
L252:- GitHub: [@tupynambalucas](https://github.com/tupynambalucas)
L253:- Based on the extension: [vscode-background](https://github.com/shalldie/vscode-background)
L254:
L255:## 📄 License
L256:
L257:MIT License - See the [LICENSE](LICENSE) file for details.
L258:
L259:---
L260:
L261:**Note**: This project is actively under development. Some features may be incomplete or experimental.
````
