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
exports.IDEAdapter = void 0;
exports.getIDEAdapter = getIDEAdapter;
const vscode = __importStar(require("vscode"));
/**
 * IDE Adapter for cross-IDE compatibility
 * Provides a unified API for VS Code and Cursor
 */
class IDEAdapter {
    constructor() {
        this.type = this.detectIDEType();
    }
    /**
     * Detect IDE type
     */
    detectIDEType() {
        // Check if running in Cursor
        if (vscode.env.appName.toLowerCase().includes('cursor')) {
            return 'cursor';
        }
        return 'vscode';
    }
    /**
     * Get active file path
     */
    getActiveFile() {
        return vscode.window.activeTextEditor?.document.fileName;
    }
    /**
     * Get workspace root path
     */
    getWorkspaceRoot() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return workspaceFolders?.[0]?.uri.fsPath;
    }
    /**
     * Get all open files
     */
    getOpenFiles() {
        return vscode.window.visibleTextEditors.map(editor => editor.document.fileName);
    }
    /**
     * Get selected text in active editor
     */
    getSelectedText() {
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
    getCursorPosition() {
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
    showMessage(message, type) {
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
    async showQuickPick(items, options) {
        return (await vscode.window.showQuickPick(items, options));
    }
    /**
     * Check if running in Cursor
     */
    isCursor() {
        return this.type === 'cursor';
    }
    /**
     * Check if running in VS Code
     */
    isVSCode() {
        return this.type === 'vscode';
    }
    /**
     * Get IDE-specific features
     */
    getIDEFeatures() {
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
    getIDEName() {
        return this.type === 'cursor' ? 'Cursor' : 'Visual Studio Code';
    }
}
exports.IDEAdapter = IDEAdapter;
// Singleton instance
let adapterInstance = null;
function getIDEAdapter() {
    if (!adapterInstance) {
        adapterInstance = new IDEAdapter();
    }
    return adapterInstance;
}
//# sourceMappingURL=ideAdapter.js.map