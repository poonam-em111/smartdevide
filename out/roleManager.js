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
exports.RoleManager = exports.DeveloperRole = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("./types");
Object.defineProperty(exports, "DeveloperRole", { enumerable: true, get: function () { return types_1.DeveloperRole; } });
const defaults_1 = require("./config/defaults");
class RoleManager {
    constructor(context) {
        this.context = context;
        this.currentRole = this.loadSelectedRole();
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'smartdevide.selectRole';
        this.updateStatusBar();
        this.statusBarItem.show();
    }
    /**
     * Show role selection quick pick
     */
    async selectRole() {
        const items = defaults_1.DEFAULT_ROLES.map(role => ({
            label: `${role.icon} ${role.name}`,
            description: role.code,
            detail: role.description,
            role: role
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select your developer role',
            title: 'SmartDevIDE - Role Selection',
            matchOnDescription: true,
            matchOnDetail: true
        });
        if (selected) {
            await this.setRole(selected.role.name);
            vscode.window.showInformationMessage(`Role set to: ${selected.role.name}`);
        }
    }
    /**
     * Set current role
     */
    async setRole(role) {
        this.currentRole = role;
        await this.context.globalState.update(RoleManager.ROLE_KEY, role);
        this.updateStatusBar();
    }
    /**
     * Get current role
     */
    getCurrentRole() {
        return this.currentRole;
    }
    /**
     * Get current role metadata
     */
    getCurrentRoleMetadata() {
        return defaults_1.DEFAULT_ROLES.find(r => r.name === this.currentRole);
    }
    /**
     * Get role by code
     */
    getRoleByCode(code) {
        return defaults_1.DEFAULT_ROLES.find(r => r.code === code);
    }
    /**
     * Auto-detect role based on current file
     */
    async autoDetectRole() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return undefined;
        }
        const fileName = editor.document.fileName;
        const languageId = editor.document.languageId;
        // Find matching role based on file patterns
        for (const role of defaults_1.DEFAULT_ROLES) {
            for (const pattern of role.filePatterns) {
                if (this.matchesPattern(fileName, pattern)) {
                    return role.name;
                }
            }
        }
        // Fallback: match by language
        const languageRoleMap = {
            'php': types_1.DeveloperRole.COREPHP,
            'javascript': types_1.DeveloperRole.FRONTEND,
            'typescript': types_1.DeveloperRole.BACKEND,
            'typescriptreact': types_1.DeveloperRole.REACT,
            'javascriptreact': types_1.DeveloperRole.REACT,
            'python': types_1.DeveloperRole.BACKEND,
            'markdown': types_1.DeveloperRole.PM
        };
        return languageRoleMap[languageId];
    }
    /**
     * Check if file matches pattern
     */
    matchesPattern(fileName, pattern) {
        // Simple pattern matching
        const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
        return regex.test(fileName);
    }
    /**
     * Load selected role from storage
     */
    loadSelectedRole() {
        const config = vscode.workspace.getConfiguration('smartdevide');
        const saved = this.context.globalState.get(RoleManager.ROLE_KEY);
        return saved || config.get('defaultRole', 'backend');
    }
    /**
     * Update status bar display
     */
    updateStatusBar() {
        const roleMetadata = this.getCurrentRoleMetadata();
        if (roleMetadata) {
            this.statusBarItem.text = `${roleMetadata.icon} ${roleMetadata.name}`;
            this.statusBarItem.tooltip = `Current Role: ${roleMetadata.name}\n${roleMetadata.description}\nClick to change`;
        }
        else {
            this.statusBarItem.text = '🎯 Select Role';
            this.statusBarItem.tooltip = 'Click to select developer role';
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.RoleManager = RoleManager;
RoleManager.ROLE_KEY = 'smartdevide.selectedRole';
//# sourceMappingURL=roleManager.js.map