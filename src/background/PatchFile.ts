import { randomUUID } from 'crypto';
import fs, { constants as fsConstants } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

import * as vscode from 'vscode'; // Using * as vscode for consistency and to avoid conflicts
import { BACKGROUND_VER, VERSION, ENCODING } from '../utils/constants';
import { sudoExec } from '../utils/sudo';

export enum EFilePatchType {
    /**
     * Unmodified file
     */
    None,
    /**
     * Patched old version of the file
     */
    Legacy,
    /**
     * Patched new version of the file
     */
    Latest
}

/**
 * Abstract class for file patching operations
 */
export abstract class AbsPatchFile {
    constructor(protected filePath: string) {}

    /**
     * Checks if the file has been patched
     */
    public async hasPatched(): Promise<boolean> {
        const editType = await this.getPatchType();
        return editType !== EFilePatchType.None;
    }

    /**
     * Gets the current patch status of the file
     */
    public async getPatchType(): Promise<EFilePatchType> {
        const content = await this.getContent();

        // Patched new version
        if (content.includes(`${BACKGROUND_VER}.${VERSION}`)) {
            return EFilePatchType.Latest;
        }

        // Patched old version (contains BACKGROUND_VER but not the current VERSION)
        if (content.includes(BACKGROUND_VER)) {
            return EFilePatchType.Legacy;
        }

        return EFilePatchType.None;
    }

    protected async getContent(): Promise<string> {
        return fs.promises.readFile(this.filePath, ENCODING);
    }

    private async saveContentTo(targetFilePath: string, content: string): Promise<boolean> {
        try {
            if (fs.existsSync(targetFilePath)) {
                await fs.promises.access(targetFilePath, fsConstants.W_OK);
            }
            await fs.promises.writeFile(targetFilePath, content, ENCODING);
            return true;
        } catch (e: any) {
            const retry = 'Retry with Admin/Sudo';
            const result = await vscode.window.showErrorMessage(
                `Failed to write to file: ${e.message}. Attempt to write with elevated privileges?`,
                retry
            );
            if (result !== retry) {
                return false;
            }
            const tempFilePath = path.join(tmpdir(), `codecanvas-temp-${randomUUID()}.temp`);
            await fs.promises.writeFile(tempFilePath, content, ENCODING);
            try {
                const mvcmd = process.platform === 'win32' ? 'move /Y' : 'mv -f';
                const cmdarg = `${mvcmd} "${tempFilePath}" "${targetFilePath}"`;
                await sudoExec(cmdarg, { name: 'CodeCanvas Extension' });
                return true;
            } catch (e: any) {
                vscode.window.showErrorMessage(`Failed to write with elevated privileges: ${e.message}`);
                // Provide a link to common issues if applicable
                return false;
            } finally {
                await fs.promises.rm(tempFilePath, { force: true });
            }
        }
    }

    protected async write(content: string): Promise<boolean> {
        if (!content.trim().length) {
            return false;
        }
        return this.saveContentTo(this.filePath, content);
    }

    /**
     * Applies patches to the file. Must contain `${BACKGROUND_VER}.${VERSION}`
     */
    public abstract applyPatches(patchContent: string): Promise<boolean>;

    /**
     * Cleans patches from the file, returning the 'clean' source file content.
     */
    protected abstract cleanPatches(content: string): string;

    public async restore(): Promise<boolean> {
        try {
            let content = await this.getContent();
            content = this.cleanPatches(content);
            return await this.write(content);
        } catch (e: any) {
            vscode.window.showErrorMessage(`Failed to restore file: ${e.message}`);
            return false;
        }
    }
}

/**
 * JavaScript file patching operations
 */
export class JsPatchFile extends AbsPatchFile {
    public async applyPatches(patchContent: string): Promise<boolean> {
        try {
            const curContent = await this.getContent();
            let content = this.cleanPatches(curContent);
            content += [
                `\n// codecanvas-background-start ${BACKGROUND_VER}.${VERSION}`,
                patchContent,
                '// codecanvas-background-end'
            ].join('\n');

            // file unchanged
            if (curContent === content) {
                return true;
            }

            return await this.write(content);
        } catch (e: any) {
            vscode.window.showErrorMessage(`Failed to apply patches to JS file: ${e.message}`);
            return false;
        }
    }

    protected cleanPatches(content: string): string {
        // Use a more specific regex to avoid conflicts with other comments
        content = content.replace(/\n\/\/ codecanvas-background-start[\s\S]*?\/\/ codecanvas-background-end/, '');
        return content;
    }
}