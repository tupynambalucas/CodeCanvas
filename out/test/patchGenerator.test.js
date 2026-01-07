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
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const PatchGenerator_1 = require("../background/PatchGenerator");
suite('PatchGenerator Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Fullscreen mode should only include fullscreen patch', () => {
        const config = {
            enabled: true,
            fullscreen: true,
            background: {
                fullscreen: {
                    images: ['test.png'],
                    opacity: 0.1,
                    size: 'cover',
                    position: 'center',
                    interval: 0,
                    random: false
                },
                editor: {
                    images: ['editor.png'],
                    useFront: true,
                    style: {},
                    styles: [],
                    interval: 0,
                    random: false
                }
            },
            useFront: true,
            style: {},
            styles: [],
            customImages: [],
            interval: 0
        };
        const script = PatchGenerator_1.PatchGenerator.create(config);
        assert.ok(script.includes('--background-fullscreen-img'), 'Should include fullscreen patch');
        assert.ok(!script.includes('--background-editor-placeholder'), 'Should NOT include editor patch');
        assert.ok(!script.includes('--background-sidebar-img'), 'Should NOT include sidebar patch');
    });
    test('Sectioned mode should include per-area patches', () => {
        const config = {
            enabled: true,
            fullscreen: false,
            background: {
                editor: {
                    images: ['editor.png'],
                    useFront: true,
                    style: {},
                    styles: [],
                    interval: 0,
                    random: false
                },
                sidebar: {
                    images: ['sidebar.png'],
                    opacity: 0.1,
                    size: 'cover',
                    position: 'center',
                    interval: 0,
                    random: false
                }
            },
            useFront: true,
            style: {},
            styles: [],
            customImages: [],
            interval: 0
        };
        const script = PatchGenerator_1.PatchGenerator.create(config);
        assert.ok(!script.includes('--background-fullscreen-img'), 'Should NOT include fullscreen patch');
        assert.ok(script.includes('--background-editor-placeholder'), 'Should include editor patch');
        assert.ok(script.includes('--background-sidebar-img'), 'Should include sidebar patch');
    });
    test('Carousel logic should be present in script', () => {
        const config = {
            enabled: true,
            fullscreen: false,
            background: {
                editor: {
                    images: ['editor1.png', 'editor2.png'],
                    useFront: true,
                    style: {},
                    styles: [],
                    interval: 10, // 10 seconds
                    random: true
                }
            },
            useFront: true,
            style: {},
            styles: [],
            customImages: [],
            interval: 0
        };
        const script = PatchGenerator_1.PatchGenerator.create(config);
        assert.ok(script.includes('setInterval'), 'Should include setInterval for carousel');
        assert.ok(script.includes('const random = true;'), 'Should have random set to true');
    });
});
//# sourceMappingURL=patchGenerator.test.js.map