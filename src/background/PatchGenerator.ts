import { pathToFileURL } from 'url';
import uglifyjs from 'uglify-js';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import fg from 'fast-glob';
import * as stylis from 'stylis';

import { _ } from '../utils/_';
import { vscodePath } from '../utils/vscodePath';
import { BACKGROUND_VER, VERSION } from '../utils/constants';

// --- Interfaces for Configuration ---
export class LegacyEditorPatchGeneratorConfig {
  useFront = true;
  style: Record<string, string> = {};
  styles: Array<Record<string, string>> = [];
  customImages: string[] = [];
  interval = 0;
}

export class EditorPatchGeneratorConfig {
  useFront = true;
  style: Record<string, string> = {};
  styles: Array<Record<string, string>> = [];
  images: string[] = [];
  interval = 0;
  random = false;
}

export class FullscreenPatchGeneratorConfig {
  images = [] as string[];
  opacity = 0.1;
  size = 'cover' as 'cover' | 'contain';
  position = 'center';
  interval = 0;
  random = false;
}

export class SidebarPatchGeneratorConfig extends FullscreenPatchGeneratorConfig {}
export class AuxiliarybarPatchGeneratorConfig extends FullscreenPatchGeneratorConfig {}
export class PanelPatchGeneratorConfig extends FullscreenPatchGeneratorConfig {}
// Nova configuração para Secondary Bar
export class SecondarybarPatchGeneratorConfig extends FullscreenPatchGeneratorConfig {}

export type TPatchGeneratorConfig = {
  enabled: boolean;
  fullscreen?: boolean;
  background?: {
    editor?: EditorPatchGeneratorConfig;
    sidebar?: SidebarPatchGeneratorConfig;
    auxiliarybar?: AuxiliarybarPatchGeneratorConfig;
    secondarybar?: SecondarybarPatchGeneratorConfig; // Adicionado suporte aqui
    panel?: PanelPatchGeneratorConfig;
    fullscreen?: FullscreenPatchGeneratorConfig;
  };
} & LegacyEditorPatchGeneratorConfig;

// --- Base Patch Generator ---
export function css(template: TemplateStringsArray, ...args: any[]) {
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

export abstract class AbsPatchGenerator<T extends { images?: string[] }> {
  protected config: T;
  protected imageRequired = true;

  constructor(config: T) {
    const images = (config?.images || []).filter((n) => n.length);
    this.config = {
      ...config,
      images: images.flatMap((img) => {
        if (img.startsWith('http')) {
          return [img];
        }
        if (/\.[^\\/]+$/.test(img)) {
          return this.normalizeImageUrls([img]);
        }
        return this.normalizeImageUrls(this.getImagesFromFolders([img]));
      }),
    };
  }

  private normalizeImageUrls(images: string[] = []) {
    return images.map((imageUrl) => {
      try {
        if (!imageUrl.startsWith('file://')) {
          imageUrl = pathToFileURL(imageUrl).href;
        }
        const url = imageUrl.replace('file://', 'vscode-file://vscode-app');
        return vscode.Uri.parse(url).toString();
      } catch {
        return '';
      }
    });
  }

  private getImagesFromFolders(folders: string[] = []) {
    try {
      const types = ['svg', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'mp4', 'otf', 'ttf'];
      return fg.sync(
        folders
          .map((f) => f.replace(/\\/g, '/').replace(/\/+$/, ''))
          .map((f) => `${f}/**/*.@(${types.join('|')})`),
        { onlyFiles: true, absolute: true, caseSensitiveMatch: false },
      );
    } catch {
      return [];
    }
  }

  protected compileCSS(source: string) {
    return stylis.serialize(stylis.compile(source), stylis.stringify);
  }

  protected getPreload() {
    const images = (this.config.images || []).filter((n) => n.length);
    if (!images.length || images.length > 10) {
      return '';
    }
    return `
const images = ${JSON.stringify(images)};
images.forEach(url => {
    const img = new Image();
    img.src = url;
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

  protected getStyle() {
    return '';
  }
  protected getScript() {
    return '';
  }

  public create() {
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
      script,
    ]
      .filter((n) => !!n.length)
      .map((n) => _.withIIFE(n))
      .join(';');
  }
}

export class WithoutImagesPatchGenerator extends AbsPatchGenerator<any> {
  constructor() {
    super({ images: [] });
  }
  protected readonly imageRequired = false;
}

// --- Specific Patch Generators ---

export class ChecksumsPatchGenerator extends WithoutImagesPatchGenerator {
  private readonly Translations = [
    'installation appears to be corrupt. Please reinstall.',
    'parece estar corrompida. Reinstale-o.',
    '安装似乎损坏。请重新安装。',
  ];

  protected getStyle(): string {
    return this.Translations.map(
      (trans) => css`
        .notification-toast-container:has([aria-label*='${trans}']) {
          display: none;
        }
      `,
    ).join(' ');
  }
}

export class ThemePatchGenerator extends WithoutImagesPatchGenerator {
  static readonly cssMixBlendMode = '--background-css-mix-blend-mode';

  protected getStyle(): string {
    return css`
      body {
        ${ThemePatchGenerator.cssMixBlendMode}: unset;
      }
      body:has(> .monaco-workbench.vs-dark) {
        ${ThemePatchGenerator.cssMixBlendMode}: screen;
      }
    `;
  }
}

export class EditorPatchGenerator extends AbsPatchGenerator<EditorPatchGeneratorConfig> {
  public static mergeLegacyConfig(
    legacy: LegacyEditorPatchGeneratorConfig,
    config: EditorPatchGeneratorConfig,
  ): EditorPatchGeneratorConfig {
    // Adicionado ?. antes de .length para segurança
    if (!legacy?.customImages?.length || config?.images?.length) {
      return config;
    }
    return { ...legacy, images: legacy.customImages, random: false };
  }

  private readonly cssplaceholder = '--background-editor-placeholder';

  private get curConfig() {
    return { ...new EditorPatchGeneratorConfig(), ...this.config };
  }

  private getStyleByOptions(style: Record<string, string>, useFront: boolean): string {
    const excludeKeys = useFront ? [] : ['pointer-events', 'z-index'];
    return Object.entries(style)
      .filter(([key]) => !excludeKeys.includes(key))
      .map(([key, value]) => `${key}: ${value};`)
      .join('');
  }

  private get imageStyles() {
    const { images, style, styles, useFront } = this.curConfig;
    return (images || []).map((img, index) => {
      return this.getStyleByOptions(
        { ...style, ...((styles && styles[index]) || {}), 'background-image': `url(${img})` },
        useFront,
      );
    });
  }

  private get styleTemplate() {
    const { images, useFront } = this.curConfig;
    const frontContent = useFront ? 'after' : 'before';

    return this.compileCSS(css`
      .minimap {
        opacity: 0.8;
      }
      [id='workbench.parts.editor'] .split-view-view {
        .editor-container .overflow-guard > .monaco-scrollable-element > .monaco-editor-background {
          background: none;
        }
        ${(images || []).map((_img, index) => {
          const nthChild = `${(images || []).length}n + ${index + 1}`;
          return css`
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
              ${this.cssplaceholder + (index % (images || []).length)}: #000;
              ${this.cssplaceholder + '-end'}: #000;
            }
          `;
        })}
      }
    `);
  }

  protected getScript(): string {
    const { interval, random } = this.curConfig;
    if (!(this.curConfig.images && this.curConfig.images.length)) {
      return '';
    }

    return `
const styleTemplate = ${JSON.stringify(this.styleTemplate)};
const cssplaceholder = '${this.cssplaceholder}';
const imageStyles = ${JSON.stringify(this.imageStyles)};
const interval = ${interval};
const random = ${random};
let curIndex = -1;
const style = (() => {
    const ele = document.createElement('style');
    document.head.appendChild(ele);
    return ele;
})();
function getNextStyles() {
    if (random) return imageStyles.slice().sort(() => Math.random() - 0.5);
    curIndex++;
    curIndex = curIndex % imageStyles.length;
    return imageStyles.map((_s, index) => imageStyles[(curIndex + index) % imageStyles.length]);
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
if (interval > 0) setInterval(setNextStyles, interval * 1000);
setNextStyles();
`;
  }
}

export class FullscreenPatchGenerator<
  T extends FullscreenPatchGeneratorConfig,
> extends AbsPatchGenerator<T> {
  protected cssvariable = '--background-fullscreen-img';

  protected get curConfig(): T {
    const cur = { ...new FullscreenPatchGeneratorConfig(), ...this.config };
    if (cur.opacity < 0 || cur.opacity > 0.6) {
      cur.opacity = 0.1;
    }
    return cur as T;
  }

  protected getStyle(): string {
    const { size, position, opacity } = this.curConfig;
    return css`
      body::after {
        content: '';
        display: block;
        position: absolute;
        z-index: 99;
        inset: 0;
        pointer-events: none;
        background-size: ${size};
        background-repeat: no-repeat;
        background-position: ${position};
        opacity: ${opacity};
        transition: 1s;
        mix-blend-mode: var(${ThemePatchGenerator.cssMixBlendMode}, normal);
        background-image: var(${this.cssvariable});
      }
    `;
  }

  protected getScript(): string {
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
    if (random) return images[Math.floor(Math.random() * images.length)];
    curIndex = (curIndex + 1) % images.length;
    return images[curIndex];
}
function setNextImg() {
    document.body.style.setProperty(cssvariable, 'url(' + getNextImg() + ')');
}
if (interval > 0) setInterval(setNextImg, interval * 1000);
setNextImg();
`;
  }
}

export class SidebarPatchGenerator extends FullscreenPatchGenerator<SidebarPatchGeneratorConfig> {
  protected cssvariable = '--background-sidebar-img';
  protected getStyle(): string {
    const { size, position, opacity } = this.curConfig;
    return css`
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

// IMPLEMENTAÇÃO: Secondary Sidebar (Barra Lateral Direita)
export class SecondarybarPatchGenerator extends FullscreenPatchGenerator<SecondarybarPatchGeneratorConfig> {
  protected cssvariable = '--background-secondarybar-img';
  protected getStyle(): string {
    const { size, position, opacity } = this.curConfig;
    return css`
      .split-view-view > .part.sidebar-secondary::after,
      .split-view-view > .part.auxiliarybar::after {
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

export class AuxiliarybarPatchGenerator extends FullscreenPatchGenerator<AuxiliarybarPatchGeneratorConfig> {
  protected cssvariable = '--background-auxiliarybar-img';
  protected getStyle(): string {
    const { size, position, opacity } = this.curConfig;
    return css`
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

export class PanelPatchGenerator extends FullscreenPatchGenerator<PanelPatchGeneratorConfig> {
  protected readonly cssvariable = '--background-panel-img';
  protected getStyle(): string {
    const { size, position, opacity } = this.curConfig;
    return css`
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

export class PatchGenerator {
  public static create(options: TPatchGeneratorConfig) {
    const scriptParts: string[] = [];
    scriptParts.push(new ChecksumsPatchGenerator().create());
    scriptParts.push(new ThemePatchGenerator().create());

    if (options.fullscreen && options.background?.fullscreen) {
      scriptParts.push(new FullscreenPatchGenerator(options.background.fullscreen).create());
    } else {
      if (options.background?.editor) {
        scriptParts.push(
          new EditorPatchGenerator(
            EditorPatchGenerator.mergeLegacyConfig(options, options.background.editor),
          ).create(),
        );
      }
      if (options.background?.sidebar) {
        scriptParts.push(new SidebarPatchGenerator(options.background.sidebar).create());
      }
      if (options.background?.secondarybar) {
        // CHAMADA: Nova Barra Lateral Direita
        scriptParts.push(new SecondarybarPatchGenerator(options.background.secondarybar).create());
      }
      if (options.background?.auxiliarybar) {
        scriptParts.push(new AuxiliarybarPatchGenerator(options.background.auxiliarybar).create());
      }
      if (options.background?.panel) {
        scriptParts.push(new PanelPatchGenerator(options.background.panel).create());
      }
    }

    return scriptParts
      .filter((n) => !!n.length)
      .map((n) => _.withIIFE(n))
      .join(';');
  }
}
