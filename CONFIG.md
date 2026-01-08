# ⚙️ Configuration Guide — CodeCanvas

This document details all configuration options available for **CodeCanvas**. All settings are managed under the `codecanvas` namespace in your `settings.json`.

## 📦 Basic Structure

The core of the configuration is the `codecanvas.ui` object. A global `codecanvas.enabled` flag allows you to quickly turn the extension's background features on or off.

```json
{
  "codecanvas.enabled": true, // Global switch for all background features
  "codecanvas.ui": {
    "fullscreen": false,
    "background": {
      // Background settings for different areas go here
    }
  }
}
```

---

## 🖥️ Fullscreen Mode

Fullscreen mode applies a single, unified background across the entire VS Code window, ignoring per-area settings. This is ideal for a seamless wallpaper.

**Activation**: Set `"fullscreen": true`.

```json
{
  "codecanvas.ui": {
    "fullscreen": true,
    "background": {
      "images": [
        "file:///path/to/your/image.jpg",
        "https://example.com/some-wallpaper.png"
      ],
      "random": true,       // Optional: shuffle the images
      "interval": 900,      // Optional: switch image every 15 minutes (in seconds)
      "opacity": 0.15,      // Main background opacity
      "size": "cover",      // CSS background-size property
      "position": "center"  // CSS background-position property
    }
  }
}
```

---

## 🧩 Sectioned Mode (Default)

This mode provides granular control, allowing you to set different backgrounds for the **Editor**, **Sidebar**, **Panel**, and **Secondary View**.

**Activation**: Set `"fullscreen": false` (or omit it, as it's the default).

```json
{
  "codecanvas.ui": {
    "fullscreen": false,
    "background": {
      
      // 📝 Editor configuration
      "editor": {
        "images": ["file:///path/to/code-background.png"],
        "opacity": 0.08,
        "size": "auto",
        "position": "right bottom",
        "style": { // Custom CSS for advanced tweaks
          "background-repeat": "no-repeat"
        }
      },

      // 🗄️ Sidebar configuration
      "sidebar": {
        "images": ["file:///path/to/sidebar-texture.png"],
        "opacity": 0.05,
        "size": "cover"
      },

      // 💻 Panel configuration (Terminal, Output, etc.)
      "panel": {
        "images": [], // An empty array disables the background for this area
        "opacity": 0.1
      },

      // 📺 Secondary View configuration (e.g., Test Explorer, second sidebar)
      "secondarybar": {
        "images": ["file:///path/to/secondary-bg.jpg"],
        "opacity": 0.1,
        "size": "cover"
      }
    }
  }
}
```

---

## 🎨 Automatic Theme Integration

CodeCanvas can automatically apply background settings provided by a VS Code theme. If a theme includes a `backgroundConfig` object in its `theme.json` file, CodeCanvas will detect and apply it when the theme is activated.

This allows theme authors to create a complete visual experience out of the box.

### For Theme Developers

To integrate your theme with CodeCanvas, add a `backgroundConfig` key to your theme's JSON file. The structure of this object is identical to the `codecanvas.ui.background` object.

**Example (`your-theme.json`):**
```json
{
  "name": "My Awesome Theme",
  "type": "dark",
  "colors": {
    "editor.background": "#1A1A1A"
    // ... other theme colors
  },
  "backgroundConfig": {
    "editor": {
      "images": ["https://res.cloudinary.com/deqmqcdww/image/upload/v1767592000/karmets_biohtu.png"],
      "opacity": 0.1,
      "size": "cover"
    },
    "sidebar": {
      "images": ["file:///path/to/your/theme/sidebar.png"],
      "opacity": 0.05
    }
  }
}
```
When a user with CodeCanvas installed selects "My Awesome Theme," these background settings will be applied automatically.

---

## 📚 Property Reference

### Top-Level

| Property | Type | Description |
|---|---|---|
| `codecanvas.enabled` | `boolean` | Globally enables or disables all background rendering. |
| `codecanvas.ui` | `object` | The main container for all UI and background settings. |

### `codecanvas.ui` Object

| Property | Type | Description |
|---|---|---|
| `fullscreen` | `boolean` | If `true`, enables global fullscreen mode. Defaults to `false`. |
| `background` | `object` | Contains the configuration for all background areas. |

### `background` Object

This object holds the settings for either **fullscreen** mode or **sectioned** mode.

- **In Fullscreen Mode (`fullscreen: true`)**: The properties below are applied directly to the `background` object.
- **In Sectioned Mode (`fullscreen: false`)**: The properties are applied within sub-objects: `editor`, `sidebar`, `panel`, or `secondarybar`.

| Property | Type | Default | Description |
|---|---|---|---|
| `images` | `string[]` | `[]` | An array of image URLs (local `file:///` or remote `https://`). Can also be a path to a folder to load all images inside it. |
| `random` | `boolean` | `false` | If `true`, shuffles the `images` array for random playback. |
| `interval` | `number` | `0` | Time in seconds for image rotation (carousel). `0` disables it. |
| `opacity` | `number` | `0.1` | The background transparency, from `0.0` (invisible) to `1.0` (fully opaque). |
| `size` | `string` | `cover` | Sets the CSS `background-size` property (e.g., `cover`, `contain`, `auto`, `100% 100%`). |
| `position` | `string` | `center`| Sets the CSS `background-position` property (e.g., `center`, `top right`). |
| `style` | `object` | `{}` | An object for any other custom CSS properties to be applied to the background element (e.g., `{"background-repeat": "no-repeat"}`). |
| `useFront`| `boolean` | `true` | **Editor only**. If `true`, renders the background on top of the editor content (useful for transparent images). |

---

## ❓ Frequently Asked Questions

**Q: My images are not showing up.**
**A:** First, check the developer console (`Help > Toggle Developer Tools`) for any errors from CodeCanvas. Then, verify the following:
  - Local file paths must be absolute and start with `file:///`.
  - Remote URLs must be accessible from your machine.
  - If you've just changed the settings, run the command `CodeCanvas: Install / Enable` and reload VS Code when prompted.

**Q: VS Code says my installation is "corrupted". Is this safe?**
**A:** Yes, this is expected. To apply backgrounds, CodeCanvas must modify one of VS Code's core files. This modification triggers a checksum warning. The extension includes a patch to hide this notification. You can safely dismiss the initial warning.

**Q: How do I completely uninstall the background modifications?**
**A:** Run the `CodeCanvas: Uninstall Patch` command from the Command Palette (`Ctrl+Shift+P`). This will restore the original VS Code file and remove all injected styles. You will be prompted to reload.

**Q: Will this slow down my VS Code?**
**A:** The performance impact is minimal. The extension injects a small amount of CSS and JavaScript. Using very large, unoptimized images may have a slight impact on startup time, but it should not affect editing performance.

**Q: How do I disable the backgrounds temporarily?**
**A:** Run the `CodeCanvas: Disable` command. This will turn off the backgrounds without requiring an uninstall and reload. To re-enable, run `CodeCanvas: Install / Enable`.