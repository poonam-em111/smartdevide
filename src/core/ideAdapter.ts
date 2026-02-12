import * as vscode from 'vscode';
import { IDEType, IDEAdapter as IIDEAdapter } from '../types';

/**
 * IDE Adapter for cross-IDE compatibility
 * Provides a unified API for VS Code and Cursor
 */
export class IDEAdapter implements IIDEAdapter {
    type: IDEType;

    constructor() {
        this.type = this.detectIDEType();
    }

    /**
     * Detect IDE type
     */
    private detectIDEType(): IDEType {
        // Check if running in Cursor
        if (vscode.env.appName.toLowerCase().includes('cursor')) {
            return 'cursor';
        }
        return 'vscode';
    }

    /**
     * Get active file path
     */
    getActiveFile(): string | undefined {
        return vscode.window.activeTextEditor?.document.fileName;
    }

    /**
     * Get workspace root path
     */
    getWorkspaceRoot(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return workspaceFolders?.[0]?.uri.fsPath;
    }

    /**
     * Get all open files
     */
    getOpenFiles(): string[] {
        return vscode.window.visibleTextEditors.map(editor => editor.document.fileName);
    }

    /**
     * Get selected text in active editor
     */
    getSelectedText(): string | undefined {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return undefined;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            return undefined;
        }

        return editor.document.getText(selection);
    }

    /**
     * Get cursor position
     */
    getCursorPosition(): { line: number; character: number } | undefined {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return undefined;
        }

        const position = editor.selection.active;
        return {
            line: position.line,
            character: position.character
        };
    }

    /**
     * Show message to user
     */
    showMessage(message: string, type: 'info' | 'warning' | 'error'): void {
        switch (type) {
            case 'info':
                vscode.window.showInformationMessage(message);
                break;
            case 'warning':
                vscode.window.showWarningMessage(message);
                break;
            case 'error':
                vscode.window.showErrorMessage(message);
                break;
        }
    }

    /**
     * Show quick pick
     */
    async showQuickPick<T>(items: T[], options?: any): Promise<T | undefined> {
        return (await vscode.window.showQuickPick(items as any, options)) as T | undefined;
    }

    /**
     * Check if running in Cursor
     */
    isCursor(): boolean {
        return this.type === 'cursor';
    }

    /**
     * Check if running in VS Code
     */
    isVSCode(): boolean {
        return this.type === 'vscode';
    }

    /**
     * Get IDE-specific features
     */
    getIDEFeatures(): {
        supportsNativeAI: boolean;
        supportsCustomModels: boolean;
        supportsComposer: boolean;
    } {
        if (this.isCursor()) {
            return {
                supportsNativeAI: true,
                supportsCustomModels: true,
                supportsComposer: true
            };
        }

        return {
            supportsNativeAI: false,
            supportsCustomModels: true,
            supportsComposer: false
        };
    }

    /**
     * Get IDE name for display
     */
    getIDEName(): string {
        return this.type === 'cursor' ? 'Cursor' : 'Visual Studio Code';
    }
}

// Singleton instance
let adapterInstance: IDEAdapter | null = null;

export function getIDEAdapter(): IDEAdapter {
    if (!adapterInstance) {
        adapterInstance = new IDEAdapter();
    }
    return adapterInstance;
}
