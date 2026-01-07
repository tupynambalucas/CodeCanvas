# ⚙️ Configuration Guide — CodeCanvas

This document details all configuration options available for **CodeCanvas**, using the unified `codecanvas.ui` configuration system.

## 📦 Basic structure

All settings are stored under the `codecanvas.ui` object in your `settings.json`.

```json
{
  "codecanvas.enabled": true, // Global enable/disable for CodeCanvas backgrounds
  "codecanvas.ui": {
    "fullscreen": false,
    "background": { ... }
  }
}
```

---

## 🖥️ Fullscreen Mode (Global)

The fullscreen mode applies a single background across the entire VS Code window, covering editor, sidebar and panel. It is ideal for large images or wallpapers.

**Activation**: Set `"fullscreen": true`.
**Note**: In this mode, per-area `editor`, `sidebar` and `panel` settings are ignored.

```json
{
  "codecanvas.ui": {
    "fullscreen": true,
    "background": {
      "images": [
        "file:///C:/Users/Public/Pictures/cyberpunk-city.jpg",
        "https://example.com/wallpaper.png"
      ],
      "carousel": {
        "interval": 300,  // Switch every 5 minutes (300s)
        "random": true    // Random order
      },
      "style": {
        "background-size": "cover",
        "background-position": "center",
        "opacity": "0.15"
      }
    }
  }
}
```

---

## 🧩 Sectioned Mode (Default)

The default mode allows different backgrounds for separate areas of VS Code: **Editor**, **Sidebar**, **Panel** and **Secondary View**.

**Activation**: Set `"fullscreen": false` (or omit, since it's the default).

```json
{
  "codecanvas.ui": {
    "fullscreen": false,
    "background": {
      
      // 📝 Editor configuration
      "editor": {
        "images": ["file:///path/to/editor-bg.png"],
        "style": {
          "background-position": "right bottom",
          "background-size": "auto",
          "opacity": "0.1"
        }
      },

      // 🗄️ Sidebar configuration
      "sidebar": {
        "images": ["file:///path/to/sidebar-bg.png"],
        "style": {
          "background-size": "cover",
          "opacity": "0.05"
        }
      },

      // 💻 Panel configuration (Terminal/Output)
      "panel": {
        "images": [], // Empty = no background
        "style": {}
      },

      // 📺 Secondary View configuration (e.g. Chat, Search results)
      "secondaryView": {
        "images": [], // Empty = no background
        "style": {}
      }
    }
  }
}
```

---

## 🎨 Theme Folder Structure and Inheritance

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

### `codecanvas.ui`

| Property | Type | Description |
|---|---|---|
| `enabled` | `boolean` | Global enable/disable for CodeCanvas backgrounds. |
| `theme` | `string` | Internal theme ID (e.g. `tdev.dark.purple`). |
| `fullscreen` | `boolean` | Enables global background mode. |
| `background` | `object` | Background configuration object. |

### `background` (object)

If `fullscreen: true`, these properties are applied directly to the `background` object.
If `fullscreen: false`, these properties should be inside sub-objects `editor`, `sidebar` or `panel`.

| Property | Type | Description |
|---|---|---|
| `images` | `string[]` | List of image paths (local `file://` or remote `http://`). |
| `carousel` | `boolean` or `object` | Configures image rotation. |
| `style` | `object` | CSS styles injected into the background container. |

### `carousel` (object)

| Property | Type | Default | Description |
|---|---|---|---|
| `interval` | `number` | `0` | Time in seconds for image rotation (0 = disabled). |
| `random` | `boolean` | `false` | If `true`, images are selected randomly. |

### `style` (CSS)

You can use any valid CSS property that applies to a `div` element. Common properties include:

- `opacity`: Transparency (0.0 to 1.0)
- `background-size`: `cover`, `contain`, `auto`, or `100% 100%`
- `background-position`: `center`, `top`, `bottom`, `left`, `right`
- `background-repeat`: `no-repeat`, `repeat`

---

## ❓ Frequently Asked Questions

**Q: Images are not showing.**
A: Check the file path and ensure it starts with `file:///` (for local files) or that the URL is reachable. Try running `CodeCanvas: Install` again.

**Q: VS Code reports it as "Corrupted".**
A: This can happen when the extension modifies core files to inject backgrounds which may change internal checksums. You may dismiss the warning using the gear menu and "Don't show again".

**Q: How do I uninstall?**
A: Run the `CodeCanvas: Uninstall Patch` command. This will remove modifications applied by CodeCanvas.