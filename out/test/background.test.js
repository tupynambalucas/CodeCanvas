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
class TestPatchGenerator extends PatchGenerator_1.AbsPatchGenerator {
    getProcessedImages() {
        return this.config.images || [];
    }
}
suite('AbsPatchGenerator Test Suite', () => {
    vscode.window.showInformationMessage('Start AbsPatchGenerator tests.');
    test('Constructor should convert local paths to vscode-file URIs', () => {
        const localPath = 'C:\\Users\\test\\image.png';
        const generator = new TestPatchGenerator({ images: [localPath] });
        const expectedUri = 'vscode-file://vscode-app/c%3A/Users/test/image.png';
        const processedImages = generator.getProcessedImages();
        assert.strictEqual(processedImages[0], expectedUri);
    });
    test('Constructor should convert file:// URIs to vscode-file URIs', () => {
        const fileUri = 'file:///C:/Users/test/image.png';
        const generator = new TestPatchGenerator({ images: [fileUri] });
        const expectedUri = 'vscode-file://vscode-app/c%3A/Users/test/image.png'; // Expect encoded drive letter
        const processedImages = generator.getProcessedImages();
        assert.strictEqual(processedImages[0].toLowerCase(), expectedUri.toLowerCase());
    });
    test('Constructor should handle remote http/https URLs', () => {
        const httpUrl = 'http://example.com/image.png';
        const httpsUrl = 'https://example.com/image.png';
        const generator = new TestPatchGenerator({ images: [httpUrl, httpsUrl] });
        const processedImages = generator.getProcessedImages();
        assert.strictEqual(processedImages[0], httpUrl);
        assert.strictEqual(processedImages[1], httpsUrl);
    });
});
//# sourceMappingURL=background.test.js.map