L1:# ⚙️ Configuration Guide — CodeCanvas
L2:
L3:This document details all configuration options available for **CodeCanvas**, using the unified `codecanvas.ui` configuration system.
L4:
L5:## 📦 Basic structure
L6:
L7:All settings are stored under the `codecanvas.ui` object in your `settings.json`.
L8:
L9:`json
L10:{
L11:  "codecanvas.enabled": true,
L12:  "codecanvas.ui": {
L13:    "fullscreen": false,
L14:    "background": { ... }
L15:  }
L16:}
L17:`
L18:
L19:---
L20:
L21:## 🖥️ Fullscreen Mode (Global)
L22:
L23:The fullscreen mode applies a single background across the entire VS Code window, covering editor, sidebar and panel. It is ideal for large images or wallpapers.
L24:
L25:**Activation**: Set `"fullscreen": true`.
L26:**Note**: In this mode, per-area `editor`, `sidebar` and `panel` settings are ignored.
L27:
L28:`json
L29:{
L30:  "codecanvas.ui": {
L31:    "fullscreen": true,
L32:    "background": {
L33:      "images": [
L34:        "file:///C:/Users/Public/Pictures/cyberpunk-city.jpg",
L35:        "https://example.com/wallpaper.png"
L36:      ],
L37:      "carousel": {
L38:        "interval": 300,  // Switch every 5 minutes (300s)
L39:        "random": true    // Random order
L40:      },
L41:      "style": {
L42:        "background-size": "cover",
L43:        "background-position": "center",
L44:        "opacity": "0.15"
L45:      }
L46:    }
L47:  }
L48:}
L49:`
L50:
L51:---
L52:
L53:## 🧩 Sectioned Mode (Default)
L54:
L55:The default mode allows different backgrounds for separate areas of VS Code: **Editor**, **Sidebar** and **Panel**.
L56:
L57:**Activation**: Set `"fullscreen": false` (or omit, since it's the default).
L58:
L59:`json
L60:{
L61:  "codecanvas.ui": {
L62:    "fullscreen": false,
L63:    "background": {
L64:      
L65:      // 📝 Editor configuration
L66:      "editor": {
L67:        "images": ["file:///path/to/editor-bg.png"],
L68:        "style": {
L69:          "background-position": "right bottom",
L70:          "background-size": "auto",
L71:          "opacity": "0.1"
L72:        }
L73:      },
L74:
L75:      // 🗄️ Sidebar configuration
L76:      "sidebar": {
L77:        "images": ["file:///path/to/sidebar-bg.png"],
L78:        "style": {
L79:          "background-size": "cover",
L80:          "opacity": "0.05"
L81:        }
L82:      },
L83:
L84:      // 💻 Panel configuration (Terminal/Output)
L85:      "panel": {
L86:        "images": [], // Empty = no background
L87:        "style": {}
L88:      }
L89:    }
L90:  }
L91:}
L92:`
L93:
L94:---
L95:
L96:## 🎨 Theme Folder Structure and Inheritance

### Default Themes Location

- All built-in (default) themes are located in: `src/themes/defaults/themes/`
- Theme templates (base theme files for inheritance) are in: `src/themes/defaults/templates/`

### Theme Inheritance

- Main theme files (such as `default.dark.purple-color-theme.json`) may use the `include` field to inherit settings from a template in the templates folder.
- Only the main (selectable) theme files need to be registered to VS Code or listed in your contributions — not the templates.
- When adding themes, only register the top-level themes; templates are for internal reuse and sharing settings.

### Example: Creating a Custom Theme with a Template

To create your own theme that inherits from a template:

```json
{
  "$schema": "vscode://schemas/color-theme",
  "name": "My Custom Theme",
  "type": "dark",
  "include": "../defaults/templates/template.dark-color-theme.json",
  // ...other theme settings...
  "colors": { ... }
}
```

Your new theme will use everything from the template and only needs to override what you want to change. Remember to reference the path to the template relative to your theme file.

---

## 📚 Property reference

L97:
L98:### `codecanvas.ui`
L99:
L100:| Property | Type | Description |
L101:|---|---|---|
L102:| `theme` | `string` | Internal theme ID (e.g. `tdev.dark.purple`). |
L103:| `fullscreen` | `boolean` | Enables global background mode. |
L104:| `background` | `object` | Background configuration object. |
L105:
L106:### `background` (object)
L107:
L108:If `fullscreen: true`, these properties are applied directly to the `background` object.
L109:If `fullscreen: false`, these properties should be inside sub-objects `editor`, `sidebar` or `panel`.
L110:
L111:| Property | Type | Description |
L112:|---|---|---|
L113:| `images` | `string[]` | List of image paths (local `file://` or remote `http://`). |
L114:| `carousel` | `boolean` or `object` | Configures image rotation. |
L115:| `style` | `object` | CSS styles injected into the background container. |
L116:
L117:### `carousel` (object)
L118:
L119:| Property | Type | Default | Description |
L120:|---|---|---|---|
L121:| `interval` | `number` | `0` | Time in seconds for image rotation (0 = disabled). |
L122:| `random` | `boolean` | `false` | If `true`, images are selected randomly. |
L123:
L124:### `style` (CSS)
L125:
L126:You can use any valid CSS property that applies to a `div` element. Common properties include:
L127:
L128:- `opacity`: Transparency (0.0 to 1.0)
L129:- `background-size`: `cover`, `contain`, `auto`, or `100% 100%`
L130:- `background-position`: `center`, `top`, `bottom`, `left`, `right`
L131:- `background-repeat`: `no-repeat`, `repeat`
L132:
L133:---
L134:
L135:## ❓ Frequently Asked Questions
L136:
L137:**Q: Images are not showing.**
L138:A: Check the file path and ensure it starts with `file:///` (for local files) or that the URL is reachable. Try running `CodeCanvas: Install` again.
L139:
L140:**Q: VS Code reports it as "Corrupted".**
L141:A: This can happen when the extension modifies core files to inject backgrounds which may change internal checksums. You may dismiss the warning using the gear menu and "Don't show again".
L142:
L143:**Q: How do I uninstall?**
L144:A: Run the `CodeCanvas: Uninstall Patch` command. This will remove modifications applied by CodeCanvas.
L145:
L146:## 🧠 AI Implementation Context
L147:
L148:This file provides supporting information for an AI implementing the background functionality:
L149:
L150:- **Reference location**: `vscode-background-master/src/background/` (read-only).
L151:- **Key points**:
L152: - Create a `BackgroundManager` in `src/background/` with testable methods.
L153: - Implement `fullscreen` mode that overrides per-area backgrounds.
L154: - Support `carousel` with `interval` and `random`.
L155: - Implement safe rollback using `CodeCanvas: Uninstall Patch`.
L156:
L157:- **Progress reporting**:
L158: - For each completed step, the AI should list files changed, tests run and results, and any lint/type-check outputs.
L159: - Pause and request human approval for architectural breaking changes.
L160:
L161:See `CONTEXT.md` for the full flow, acceptance criteria and the verification checklist before marking the work as done.
