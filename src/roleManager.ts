import * as vscode from 'vscode';
import { DeveloperRole, RoleCode, RoleMetadata } from './types';

export { DeveloperRole };
import { DEFAULT_ROLES, ROLE_ICON_MAP } from './config/defaults';

export class RoleManager {
    private static readonly ROLE_KEY = 'smartdevide.selectedRole';
    private context: vscode.ExtensionContext;
    private statusBarItem: vscode.StatusBarItem;
    private currentRole: DeveloperRole;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.currentRole = this.loadSelectedRole();
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'smartdevide.selectRole';
        this.updateStatusBar();
        this.statusBarItem.show();
    }

    /**
     * Show role selection quick pick
     */
    async selectRole(): Promise<void> {
        interface RoleQuickPickItem extends vscode.QuickPickItem {
            role: RoleMetadata;
        }

        const items: RoleQuickPickItem[] = DEFAULT_ROLES.map(role => ({
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
            await this.setRole(selected.role.name as DeveloperRole);
            vscode.window.showInformationMessage(`Role set to: ${selected.role.name}`);
        }
    }

    /**
     * Set current role
     */
    async setRole(role: DeveloperRole): Promise<void> {
        this.currentRole = role;
        await this.context.globalState.update(RoleManager.ROLE_KEY, role);
        this.updateStatusBar();
    }

    /**
     * Get current role
     */
    getCurrentRole(): DeveloperRole {
        return this.currentRole;
    }

    /**
     * Get current role metadata
     */
    getCurrentRoleMetadata(): RoleMetadata | undefined {
        return DEFAULT_ROLES.find(r => r.name === this.currentRole);
    }

    /**
     * Get role by code
     */
    getRoleByCode(code: RoleCode): RoleMetadata | undefined {
        return DEFAULT_ROLES.find(r => r.code === code);
    }

    /**
     * Auto-detect role based on current file
     */
    async autoDetectRole(): Promise<DeveloperRole | undefined> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return undefined;
        }

        const fileName = editor.document.fileName;
        const languageId = editor.document.languageId;

        // Find matching role based on file patterns
        for (const role of DEFAULT_ROLES) {
            for (const pattern of role.filePatterns) {
                if (this.matchesPattern(fileName, pattern)) {
                    return role.name as DeveloperRole;
                }
            }
        }

        // Fallback: match by language
        const languageRoleMap: Record<string, DeveloperRole> = {
            'php': DeveloperRole.COREPHP,
            'javascript': DeveloperRole.FRONTEND,
            'typescript': DeveloperRole.BACKEND,
            'typescriptreact': DeveloperRole.REACT,
            'javascriptreact': DeveloperRole.REACT,
            'python': DeveloperRole.BACKEND,
            'markdown': DeveloperRole.PM
        };

        return languageRoleMap[languageId];
    }

    /**
     * Check if file matches pattern
     */
    private matchesPattern(fileName: string, pattern: string): boolean {
        // Simple pattern matching
        const regex = new RegExp(
            pattern.replace(/\*/g, '.*').replace(/\?/g, '.'),
            'i'
        );
        return regex.test(fileName);
    }

    /**
     * Load selected role from storage
     */
    private loadSelectedRole(): DeveloperRole {
        const config = vscode.workspace.getConfiguration('smartdevide');
        const saved = this.context.globalState.get<string>(RoleManager.ROLE_KEY);
        return (saved as DeveloperRole) || (config.get('defaultRole', 'backend') as any);
    }

    /**
     * Update status bar display
     */
    private updateStatusBar(): void {
        const roleMetadata = this.getCurrentRoleMetadata();
        if (roleMetadata) {
            this.statusBarItem.text = `${roleMetadata.icon} ${roleMetadata.name}`;
            this.statusBarItem.tooltip = `Current Role: ${roleMetadata.name}\n${roleMetadata.description}\nClick to change`;
        } else {
            this.statusBarItem.text = '🎯 Select Role';
            this.statusBarItem.tooltip = 'Click to select developer role';
        }
    }

    /**
     * Dispose of resources
     */
    dispose(): void {
        this.statusBarItem.dispose();
    }
}
