import * as assert from 'assert';
import * as vscode from 'vscode';
import { PatchGenerator, TPatchGeneratorConfig } from '../background/PatchGenerator';

suite('PatchGenerator Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Fullscreen mode should only include fullscreen patch', () => {
        const config: TPatchGeneratorConfig = {
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

        const script = PatchGenerator.create(config);
        
        assert.ok(script.includes('--background-fullscreen-img'), 'Should include fullscreen patch');
        assert.ok(!script.includes('--background-editor-placeholder'), 'Should NOT include editor patch');
        assert.ok(!script.includes('--background-sidebar-img'), 'Should NOT include sidebar patch');
    });

    test('Sectioned mode should include per-area patches', () => {
        const config: TPatchGeneratorConfig = {
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

        const script = PatchGenerator.create(config);
        
        assert.ok(!script.includes('--background-fullscreen-img'), 'Should NOT include fullscreen patch');
        assert.ok(script.includes('--background-editor-placeholder'), 'Should include editor patch');
        assert.ok(script.includes('--background-sidebar-img'), 'Should include sidebar patch');
    });

    test('Carousel logic should be present in script', () => {
        const config: TPatchGeneratorConfig = {
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

        const script = PatchGenerator.create(config);
        
        assert.ok(script.includes('setInterval'), 'Should include setInterval for carousel');
        assert.ok(script.includes('const random = true;'), 'Should have random set to true');
    });
});
