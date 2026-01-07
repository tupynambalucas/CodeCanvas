import * as assert from 'assert';
import * as vscode from 'vscode';
import { AbsPatchGenerator } from '../background/PatchGenerator';

class TestPatchGenerator extends AbsPatchGenerator<{ images: string[] }> {
    public getProcessedImages(): string[] {
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
