"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatchGenerator = exports.PanelPatchGenerator = exports.AuxiliarybarPatchGenerator = exports.SidebarPatchGenerator = exports.FullscreenPatchGenerator = exports.EditorPatchGenerator = exports.ThemePatchGenerator = exports.ChecksumsPatchGenerator = exports.WithoutImagesPatchGenerator = exports.AbsPatchGenerator = exports.PanelPatchGeneratorConfig = exports.AuxiliarybarPatchGeneratorConfig = exports.SidebarPatchGeneratorConfig = exports.FullscreenPatchGeneratorConfig = exports.EditorPatchGeneratorConfig = exports.LegacyEditorPatchGeneratorConfig = void 0;
exports.css = css;
const url_1 = require("url");
const vscode = __importStar(require("vscode"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const stylis = __importStar(require("stylis"));
const _1 = require("../utils/_");
// --- Interfaces for Configuration ---
class LegacyEditorPatchGeneratorConfig {
    useFront = true;
    style = {};
    styles = [];
    customImages = [];
    interval = 0;
}
exports.LegacyEditorPatchGeneratorConfig = LegacyEditorPatchGeneratorConfig;
class EditorPatchGeneratorConfig {
    useFront = true;
    style = {};
    styles = [];
    images = [];
    interval = 0;
    random = false;
}
exports.EditorPatchGeneratorConfig = EditorPatchGeneratorConfig;
class FullscreenPatchGeneratorConfig {
    images = [];
    opacity = 0.1; // Suggested range: 0.1 ~ 0.3
    size = 'cover';
    position = 'center';
    interval = 0;
    random = false;
}
exports.FullscreenPatchGeneratorConfig = FullscreenPatchGeneratorConfig;
class SidebarPatchGeneratorConfig extends FullscreenPatchGeneratorConfig {
}
exports.SidebarPatchGeneratorConfig = SidebarPatchGeneratorConfig;
class AuxiliarybarPatchGeneratorConfig extends FullscreenPatchGeneratorConfig {
}
exports.AuxiliarybarPatchGeneratorConfig = AuxiliarybarPatchGeneratorConfig;
class PanelPatchGeneratorConfig extends FullscreenPatchGeneratorConfig {
}
exports.PanelPatchGeneratorConfig = PanelPatchGeneratorConfig;
// --- Base Patch Generator ---
/**
 * For triggering dev tools css in js language support
 */
function css(template, ...args) {
    return template.reduce((prev, curr, i) => {
        let arg = args[i];
        if (typeof arg === 'function') {
            arg = arg();
        }
        if (Array.isArray(arg)) {
            arg = arg.join('');
        }
        return prev + curr + (arg ?? '');
    }, '');
}
class AbsPatchGenerator {
    config;
    imageRequired = true; // Must have images
    constructor(config) {
        const images = (config?.images || []).filter(n => n.length);
        this.config = {
            ...config,
            images: images.flatMap(img => {
                // Network images
                if (img.startsWith('http')) {
                    return [img];
                }
                // Local files with extension
                if (/\.[^\\/]+$/.test(img)) { // Fixed regex to match correctly
                    return this.normalizeImageUrls([img]);
                }
                // Folders
                return this.normalizeImageUrls(this.getImagesFromFolders([img]));
            })
        };
    }
    normalizeImageUrls(images = []) {
        return images.map(imageUrl => {
            try {
                // Convert non-file protocol (absolute path) to file protocol.
                if (!imageUrl.startsWith('file://')) {
                    imageUrl = (0, url_1.pathToFileURL)(imageUrl).href;
                }
                // Convert file protocol to vscode-file protocol.
                // file:///Users/foo/bar.png => vscode-file://vscode-app/Users/foo/bar.png
                const url = imageUrl.replace('file://', 'vscode-file://vscode-app');
                return vscode.Uri.parse(url).toString();
            }
            catch {
                return '';
            }
        });
    }
    getImagesFromFolders(folders = []) {
        try {
            const types = ['svg', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'mp4', 'otf', 'ttf'];
            return fast_glob_1.default.sync(folders
                .map(f => f.replace(/\\/g, '/').replace(/\/+$/, '')) // Handle Windows path separators, remove trailing slash
                .map(f => `${f}/**/*.@(${types.join('|')})`), { onlyFiles: true, absolute: true, caseSensitiveMatch: false });
        }
        catch {
            return [];
        }
    }
    compileCSS(source) {
        return stylis.serialize(stylis.compile(source), stylis.stringify);
    }
    getPreload() {
        const images = (this.config.images || []).filter(n => n.length);
        if (!images.length || images.length > 10) {
            return '';
        }
        return `
const images = ${JSON.stringify(images)};

// Preload images and log errors
images.forEach(url => {
    const img = new Image();
    img.src = url;
    img.onerror = () => {
        console.error('CodeCanvas: Failed to load background image:', url);
    };
});

const container = (() => {
    const cid = 'backgroundPreloadContainer';
    let c = document.getElementById(cid);
    if (!c) {
        c = document.createElement('div');
        c.id = cid;
        c.style.width = 0;
        c.style.height = 0;
        c.style.opacity = 0;
        c.style.overflow = 'hidden';
        document.body.appendChild(c);
    }
    return c;
})();

const div = document.createElement('div');
div.style.backgroundImage = images.map(url => 'url(' + url + ')').join(',');
container.appendChild(div);
`;
    }
    getStyle() {
        return '';
    }
    getScript() {
        return '';
    }
    create() {
        if (this.imageRequired && (!this.config.images || !this.config.images.length)) {
            return '';
        }
        const style = this.compileCSS(this.getStyle());
        const script = this.getScript().trim();
        return [
            this.getPreload(),
            (() => {
                if (!style.length) {
                    return '';
                }
                return `
                const style = document.createElement("style");
                style.textContent = ${JSON.stringify(style)};
                document.head.appendChild(style);`;
            })(),
            script
        ]
            .filter(n => !!n.length)
            .map(n => _1._.withIIFE(n))
            .join(';');
    }
}
exports.AbsPatchGenerator = AbsPatchGenerator;
class WithoutImagesPatchGenerator extends AbsPatchGenerator {
    constructor() {
        super({ images: [] });
    }
    imageRequired = false;
}
exports.WithoutImagesPatchGenerator = WithoutImagesPatchGenerator;
// --- Specific Patch Generators ---
class ChecksumsPatchGenerator extends WithoutImagesPatchGenerator {
    Translations = [
        // en, default
        'installation appears to be corrupt. Please reinstall.',
        // cs
        'je pravděpodobně poškozená. Proveďte prosím přeinstalaci.',
        // de
        'Installation ist offenbar beschädigt. Führen Sie eine Neuinstallation durch.',
        // es
        'parece estar dañada. Vuelva a instalar.',
        // fr
        'semble être endommagée. Effectuez une réinstallation.',
        // it
        'sembra danneggiata. Reinstallare.',
        // ja
        'インストールが壊れている可能性があります。再インストールしてください。',
        // ko
        '설치가 손상된 것 같습니다. 다시 설치하세요.',
        // pl
        'prawdopodobnie jest uszkodzona. Spróbuj zainstalować ponownie.',
        // pt-BR
        'parece estar corrompida. Reinstale-o.',
        // qps-ploc
        'ïñstællætïøñ æppëærs tø þë çørrµpt. Plëæsë rëïñstæll.',
        // ru
        'повреждена. Повторите установку.',
        // tr
        'yüklemeniz bozuk gibi görünüyor. Lütfen yeniden yükleyin.',
        // zh-hans
        '安装似乎损坏。请重新安装。',
        // zh-hant
        '安裝似乎已損毀。請重新安裝。'
    ];
    getStyle() {
        return this.Translations.map(trans => css `
                .notification-toast-container:has([aria-label*='${trans}']) {
                    display: none;
                }
            `).join(' ');
    }
}
exports.ChecksumsPatchGenerator = ChecksumsPatchGenerator;
class ThemePatchGenerator extends WithoutImagesPatchGenerator {
    static cssMixBlendMode = '--background-css-mix-blend-mode';
    getStyle() {
        return css `
            body {
                ${ThemePatchGenerator.cssMixBlendMode}: unset;
            }
            body:has(> .monaco-workbench.vs-dark) {
                ${ThemePatchGenerator.cssMixBlendMode}: screen;
            }
        `;
    }
}
exports.ThemePatchGenerator = ThemePatchGenerator;
class EditorPatchGenerator extends AbsPatchGenerator {
    static mergeLegacyConfig(legacy, config) {
        if (!legacy?.customImages.length || config?.images.length) {
            return config;
        }
        return {
            ...legacy,
            images: legacy.customImages,
            random: false
        };
    }
    cssplaceholder = '--background-editor-placeholder';
    get curConfig() {
        return {
            ...new EditorPatchGeneratorConfig(),
            ...this.config
        };
    }
    getStyleByOptions(style, useFront) {
        const excludeKeys = useFront ? [] : ['pointer-events', 'z-index'];
        return Object.entries(style)
            .filter(([key]) => !excludeKeys.includes(key))
            .map(([key, value]) => `${key}: ${value};`)
            .join('');
    }
    get imageStyles() {
        const { images, style, styles, useFront } = this.curConfig;
        return (images || []).map((img, index) => {
            return this.getStyleByOptions({
                ...style,
                ...((styles && styles[index]) || {}), // Handle styles[index] being undefined
                'background-image': `url(${img})`
            }, useFront);
        });
    }
    get styleTemplate() {
        const { images, useFront } = this.curConfig;
        const frontContent = useFront ? 'after' : 'before';
        return this.compileCSS(css `
            /* minimap */
            .minimap {
                opacity: 0.8;
            }

            [id='workbench.parts.editor'] .split-view-view {
                .editor-container .overflow-guard > .monaco-scrollable-element > .monaco-editor-background {
                    background: none;
                }
                ${(images || []).map((_img, index) => {
            const nthChild = `${(images || []).length}n + ${index + 1}`;
            return css `
                        &:nth-child(${nthChild}) .editor-instance > .monaco-editor > .overflow-guard > .monaco-scrollable-element::${frontContent} {
                            content: '';
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            z-index: ${useFront ? 99 : 'initial'};
                            pointer-events: ${useFront ? 'none' : 'initial'};
                            transition: 0.3s;
                            background-repeat: no-repeat;
                            mix-blend-mode: var(${ThemePatchGenerator.cssMixBlendMode});
                            /* placeholder, used for dynamic css replacement */
                            ${this.cssplaceholder + (index % (images || []).length)}: #000;
                            ${this.cssplaceholder + '-end'}: #000;
                        }
                    `;
        })}
            }
        `);
    }
    getScript() {
        const { interval, random } = this.curConfig;
        if (!(this.curConfig.images && this.curConfig.images.length)) {
            return '';
        }
        return `
// options
const styleTemplate = ${JSON.stringify(this.styleTemplate)};
const cssplaceholder = '${this.cssplaceholder}';
const imageStyles = ${JSON.stringify(this.imageStyles)};
const interval = ${interval};
const random = ${random};

// variables
let curIndex = -1;

const style = (() => {
    const ele = document.createElement('style');
    document.head.appendChild(ele);
    return ele;
})();

function getNextStyles() {
    if (random) {
        return imageStyles.slice().sort(() => Math.random() - 0.5);
    }
    curIndex++;
    curIndex = curIndex % imageStyles.length;
    return imageStyles.map((_s, index) => {
        const sIndex = (curIndex + index) % imageStyles.length;
        return imageStyles[sIndex];
    });
}

function setNextStyles() {
    let curStyle = styleTemplate;
    const nextStyles = getNextStyles();
    for (let i = 0; i < nextStyles.length; i++) {
        const reg = new RegExp(cssplaceholder + i + '[^;]+;', 'g');
        curStyle = curStyle.replace(reg, nextStyles[i]);
    }
    style.textContent = curStyle;
}

if (interval > 0) {
    setInterval(setNextStyles, interval * 1000);
}

setNextStyles();
`;
    }
}
exports.EditorPatchGenerator = EditorPatchGenerator;
class FullscreenPatchGenerator extends AbsPatchGenerator {
    cssvariable = '--background-fullscreen-img';
    get curConfig() {
        const cur = {
            ...new FullscreenPatchGeneratorConfig(),
            ...this.config
        };
        if (cur.opacity < 0 || cur.opacity > 0.6) {
            cur.opacity = new FullscreenPatchGeneratorConfig().opacity;
        }
        return cur;
    }
    getStyle() {
        const { size, position, opacity } = this.curConfig;
        return css `
            body::after {
                content: '';
                display: block;
                position: absolute;
                z-index: 1000;
                inset: 0;
                pointer-events: none;
                background-size: ${size};
                background-repeat: no-repeat;
                background-position: ${position};
                opacity: ${opacity};
                transition: 1s;
                mix-blend-mode: var(${ThemePatchGenerator.cssMixBlendMode});
                background-image: var(${this.cssvariable});
            }
        `;
    }
    getScript() {
        const { images, random, interval } = this.curConfig;
        if (!(images && images.length)) {
            return '';
        }
        return `
const cssvariable = '${this.cssvariable}';
const images = ${JSON.stringify(images)};
const random = ${random};
const interval = ${interval};

let curIndex = -1;

function getNextImg() {
    if (random) {
        return images[Math.floor(Math.random() * images.length)];
    }
    curIndex++;
    curIndex = curIndex % images.length;
    return images[curIndex];
}

function setNextImg() {
    document.body.style.setProperty(cssvariable, 'url(' + getNextImg() + ')');
}

if (interval > 0) {
    setInterval(setNextImg, interval * 1000);
}

setNextImg();
        `;
    }
}
exports.FullscreenPatchGenerator = FullscreenPatchGenerator;
class SidebarPatchGenerator extends FullscreenPatchGenerator {
    cssvariable = '--background-sidebar-img';
    getStyle() {
        const { size, position, opacity } = this.curConfig;
        return css `
            .split-view-view > .part.sidebar::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                z-index: 99;
                background-position: ${position};
                background-repeat: no-repeat;
                background-size: ${size};
                pointer-events: none;
                opacity: ${opacity};
                transition: 1s;
                mix-blend-mode: var(${ThemePatchGenerator.cssMixBlendMode});
                background-image: var(${this.cssvariable});
            }
        `;
    }
}
exports.SidebarPatchGenerator = SidebarPatchGenerator;
class AuxiliarybarPatchGenerator extends FullscreenPatchGenerator {
    cssvariable = '--background-auxiliarybar-img';
    getStyle() {
        const { size, position, opacity } = this.curConfig;
        return css `
            .split-view-view > .part.auxiliarybar::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-position: ${position};
                background-repeat: no-repeat;
                background-size: ${size};
                pointer-events: none;
                opacity: ${opacity};
                transition: 1s;
                mix-blend-mode: var(${ThemePatchGenerator.cssMixBlendMode});
                background-image: var(${this.cssvariable});
            }
        `;
    }
}
exports.AuxiliarybarPatchGenerator = AuxiliarybarPatchGenerator;
class PanelPatchGenerator extends FullscreenPatchGenerator {
    cssvariable = '--background-panel-img';
    getStyle() {
        const { size, position, opacity } = this.curConfig;
        return css `
            .split-view-view > .part.panel::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-position: ${position};
                background-repeat: no-repeat;
                background-size: ${size};
                pointer-events: none;
                opacity: ${opacity};
                transition: 1s;
                mix-blend-mode: var(${ThemePatchGenerator.cssMixBlendMode});
                background-image: var(${this.cssvariable});
            }
        `;
    }
}
exports.PanelPatchGenerator = PanelPatchGenerator;
class PatchGenerator {
    static create(options) {
        const scriptParts = [];
        // Always include global patches
        scriptParts.push(new ChecksumsPatchGenerator().create());
        scriptParts.push(new ThemePatchGenerator().create());
        if (options.fullscreen && options.background?.fullscreen) {
            // Fullscreen mode active, apply fullscreen background
            scriptParts.push(new FullscreenPatchGenerator(options.background.fullscreen).create());
        }
        else {
            // Sectioned mode active, apply per-area backgrounds
            if (options.background?.editor) {
                scriptParts.push(new EditorPatchGenerator(EditorPatchGenerator.mergeLegacyConfig(options, options.background.editor)).create());
            }
            if (options.background?.sidebar) {
                scriptParts.push(new SidebarPatchGenerator(options.background.sidebar).create());
            }
            if (options.background?.auxiliarybar) {
                scriptParts.push(new AuxiliarybarPatchGenerator(options.background.auxiliarybar).create());
            }
            if (options.background?.panel) {
                scriptParts.push(new PanelPatchGenerator(options.background.panel).create());
            }
        }
        const script = scriptParts
            .filter(n => !!n.length)
            .map(n => _1._.withIIFE(n))
            .join(';');
        return script; // Temporarily disable minification
        // return uglifyjs.minify(script).code;
    }
}
exports.PatchGenerator = PatchGenerator;
//# sourceMappingURL=PatchGenerator.js.map