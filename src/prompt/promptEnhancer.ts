import * as vscode from 'vscode';
import { EnhancedPrompt, PromptContext, Enhancement, DeveloperRole, ExtensionConfig } from '../types';
import { DEFAULT_ROLES } from '../config/defaults';

export class PromptEnhancer {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Enhance user prompt with context and role-specific instructions
     */
    async enhancePrompt(
        userPrompt: string,
        role: DeveloperRole,
        modelId: string
    ): Promise<EnhancedPrompt> {
        const config = this.getConfig();
        
        if (!config.autoPromptEnhancement) {
            return {
                originalPrompt: userPrompt,
                enhancedPrompt: userPrompt,
                context: await this.gatherContext(),
                role,
                model: modelId,
                enhancements: []
            };
        }

        const promptContext = await this.gatherContext();
        const enhancements: Enhancement[] = [];
        let enhancedPrompt = userPrompt;

        // Add context enhancement
        if (config.promptEnhancement.contextAwareness) {
            const contextEnhancement = this.addContextEnhancement(enhancedPrompt, promptContext);
            enhancedPrompt = contextEnhancement.prompt;
            enhancements.push(...contextEnhancement.enhancements);
        }

        // Add role-based enhancement
        if (config.promptEnhancement.roleBasedEnhancement) {
            const roleEnhancement = this.addRoleEnhancement(enhancedPrompt, role);
            enhancedPrompt = roleEnhancement.prompt;
            enhancements.push(...roleEnhancement.enhancements);
        }

        // Add code pattern suggestions
        if (config.promptEnhancement.codePatternSuggestions) {
            const patternEnhancement = this.addCodePatternSuggestions(enhancedPrompt, role, promptContext);
            enhancedPrompt = patternEnhancement.prompt;
            enhancements.push(...patternEnhancement.enhancements);
        }

        // Add best practices
        if (config.promptEnhancement.bestPracticesInjection) {
            const bestPracticesEnhancement = this.addBestPractices(enhancedPrompt, role);
            enhancedPrompt = bestPracticesEnhancement.prompt;
            enhancements.push(...bestPracticesEnhancement.enhancements);
        }

        // Add security considerations
        if (config.promptEnhancement.securityChecks) {
            const securityEnhancement = this.addSecurityGuidelines(enhancedPrompt);
            enhancedPrompt = securityEnhancement.prompt;
            enhancements.push(...securityEnhancement.enhancements);
        }

        return {
            originalPrompt: userPrompt,
            enhancedPrompt,
            context: promptContext,
            role,
            model: modelId,
            enhancements
        };
    }

    /**
     * Gather context from the IDE
     */
    private async gatherContext(): Promise<PromptContext> {
        const editor = vscode.window.activeTextEditor;
        const workspaceFolders = vscode.workspace.workspaceFolders;

        return {
            currentFile: editor?.document.fileName,
            fileType: editor?.document.languageId,
            projectType: await this.detectProjectType(),
            recentFiles: await this.getRecentFiles(),
            openFiles: vscode.window.visibleTextEditors.map(e => e.document.fileName),
            selectedCode: editor?.document.getText(editor.selection),
            cursorPosition: editor?.selection.active,
            workspaceRoot: workspaceFolders?.[0]?.uri.fsPath
        };
    }

    /**
     * Add context-aware enhancements
     */
    private addContextEnhancement(
        prompt: string,
        context: PromptContext
    ): { prompt: string; enhancements: Enhancement[] } {
        const enhancements: Enhancement[] = [];
        let contextInfo = '';

        // Add file context
        if (context.currentFile && context.fileType) {
            contextInfo += `\\n\\nCurrent Context:\\n- File: ${context.currentFile.split('/').pop()}\\n- Language: ${context.fileType}`;
            enhancements.push({
                type: 'context',
                description: 'Added current file context',
                impact: 'medium',
                addedContent: `File: ${context.fileType}`
            });
        }

        // Add project type
        if (context.projectType) {
            contextInfo += `\\n- Project Type: ${context.projectType}`;
            enhancements.push({
                type: 'context',
                description: 'Added project type context',
                impact: 'high',
                addedContent: `Project: ${context.projectType}`
            });
        }

        // Add selected code context
        if (context.selectedCode && context.selectedCode.length > 0) {
            contextInfo += `\\n- Selected Code: Yes (${context.selectedCode.split('\\n').length} lines)`;
            enhancements.push({
                type: 'context',
                description: 'Added selected code context',
                impact: 'high'
            });
        }

        return {
            prompt: prompt + contextInfo,
            enhancements
        };
    }

    /**
     * Add role-specific instructions
     */
    private addRoleEnhancement(
        prompt: string,
        role: DeveloperRole
    ): { prompt: string; enhancements: Enhancement[] } {
        const roleMetadata = DEFAULT_ROLES.find(r => r.name === role);
        if (!roleMetadata) {
            return { prompt, enhancements: [] };
        }

        const roleInstruction = `\\n\\nRole Context: You are acting as a ${roleMetadata.name}.\\nFocus on: ${roleMetadata.focusAreas.join(', ')}.\\nApproach: ${roleMetadata.promptBias}`;

        return {
            prompt: prompt + roleInstruction,
            enhancements: [{
                type: 'role',
                description: `Added ${roleMetadata.name} context`,
                impact: 'high',
                addedContent: roleInstruction
            }]
        };
    }

    /**
     * Add code pattern suggestions based on role and context
     */
    private addCodePatternSuggestions(
        prompt: string,
        role: DeveloperRole,
        context: PromptContext
    ): { prompt: string; enhancements: Enhancement[] } {
        const patterns: Record<string, string[]> = {
            'Laravel Developer': [
                'Use Eloquent ORM for database operations',
                'Follow Laravel naming conventions',
                'Use Service Container for dependency injection',
                'Implement proper validation using Form Requests'
            ],
            'Core PHP Developer': [
                'Use PDO with prepared statements',
                'Implement proper error handling',
                'Use strict types (declare(strict_types=1))',
                'Follow PSR-12 coding standards'
            ],
            'React Developer': [
                'Use functional components with hooks',
                'Implement proper TypeScript types',
                'Use React Query for server state',
                'Optimize with useMemo and useCallback'
            ],
            'Backend Developer': [
                'Implement proper error handling and logging',
                'Use database transactions for data integrity',
                'Add input validation and sanitization',
                'Consider caching strategies'
            ],
            'Frontend Developer': [
                'Ensure responsive design',
                'Implement proper accessibility',
                'Optimize images and assets',
                'Follow UI/UX best practices'
            ],
            'QA Engineer': [
                'Write comprehensive test cases',
                'Include edge cases and boundary conditions',
                'Test for security vulnerabilities',
                'Validate error handling'
            ]
        };

        const rolePatterns = patterns[role] || [];
        if (rolePatterns.length === 0) {
            return { prompt, enhancements: [] };
        }

        const patternSuggestion = `\\n\\nCode Patterns to Follow:\\n${rolePatterns.map(p => `- ${p}`).join('\\n')}`;

        return {
            prompt: prompt + patternSuggestion,
            enhancements: [{
                type: 'pattern',
                description: `Added ${rolePatterns.length} code patterns`,
                impact: 'medium',
                addedContent: patternSuggestion
            }]
        };
    }

    /**
     * Add best practices injection
     */
    private addBestPractices(
        prompt: string,
        role: DeveloperRole
    ): { prompt: string; enhancements: Enhancement[] } {
        const bestPractices = [
            'Write clean, maintainable code',
            'Add appropriate comments for complex logic',
            'Follow SOLID principles',
            'Implement proper error handling',
            'Consider performance implications'
        ];

        const practicesText = `\\n\\nBest Practices:\\n${bestPractices.map(bp => `- ${bp}`).join('\\n')}`;

        return {
            prompt: prompt + practicesText,
            enhancements: [{
                type: 'bestpractice',
                description: 'Added general best practices',
                impact: 'medium',
                addedContent: practicesText
            }]
        };
    }

    /**
     * Add security guidelines
     */
    private addSecurityGuidelines(
        prompt: string
    ): { prompt: string; enhancements: Enhancement[] } {
        const securityGuidelines = [
            'Validate and sanitize all user inputs',
            'Use parameterized queries to prevent SQL injection',
            'Implement proper authentication and authorization',
            'Protect against XSS attacks',
            'Use HTTPS and secure connections'
        ];

        const securityText = `\\n\\nSecurity Considerations:\\n${securityGuidelines.map(sg => `- ${sg}`).join('\\n')}`;

        return {
            prompt: prompt + securityText,
            enhancements: [{
                type: 'security',
                description: 'Added security guidelines',
                impact: 'high',
                addedContent: securityText
            }]
        };
    }

    /**
     * Detect project type from workspace
     */
    private async detectProjectType(): Promise<string | undefined> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return undefined;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;

        // Check for Laravel
        const laravelFiles = ['artisan', 'composer.json'];
        for (const file of laravelFiles) {
            try {
                await vscode.workspace.fs.stat(vscode.Uri.file(`${rootPath}/${file}`));
                const composerPath = vscode.Uri.file(`${rootPath}/composer.json`);
                const composerContent = await vscode.workspace.fs.readFile(composerPath);
                if (composerContent.toString().includes('laravel/framework')) {
                    return 'Laravel';
                }
            } catch {}
        }

        // Check for React
        try {
            const packageJsonPath = vscode.Uri.file(`${rootPath}/package.json`);
            const packageContent = await vscode.workspace.fs.readFile(packageJsonPath);
            const packageJson = JSON.parse(packageContent.toString());
            if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
                return 'React';
            }
            if (packageJson.dependencies?.['@angular/core']) {
                return 'Angular';
            }
            if (packageJson.dependencies?.vue) {
                return 'Vue';
            }
        } catch {}

        // Check for PHP
        const phpFiles = await vscode.workspace.findFiles('**/*.php', '**/node_modules/**', 1);
        if (phpFiles.length > 0) {
            return 'PHP';
        }

        // Check for Python
        const pythonFiles = await vscode.workspace.findFiles('**/*.py', '**/node_modules/**', 1);
        if (pythonFiles.length > 0) {
            return 'Python';
        }

        return undefined;
    }

    /**
     * Get recently opened files
     */
    private async getRecentFiles(): Promise<string[]> {
        // Get from VS Code's recent files
        return vscode.window.visibleTextEditors
            .map(editor => editor.document.fileName)
            .slice(0, 5);
    }

    /**
     * Get extension configuration
     */
    private getConfig(): ExtensionConfig {
        const config = vscode.workspace.getConfiguration('smartdevide');
        return {
            defaultRole: config.get('defaultRole', 'backend'),
            defaultModel: config.get('defaultModel', 'gpt-4-turbo'),
            autoPromptEnhancement: config.get('autoPromptEnhancement', true),
            contextAwareness: config.get('contextAwareness', true),
            roleAutoSwitch: config.get('roleAutoSwitch', false),
            showRoleInStatusBar: config.get('showRoleInStatusBar', true),
            showModelInStatusBar: config.get('showModelInStatusBar', true),
            telemetryEnabled: config.get('telemetryEnabled', true),
            models: {}, // Not needed for this class
            promptEnhancement: {
                enabled: config.get('promptEnhancement.enabled', true),
                contextAwareness: config.get('promptEnhancement.contextAwareness', true),
                roleBasedEnhancement: config.get('promptEnhancement.roleBasedEnhancement', true),
                codePatternSuggestions: config.get('promptEnhancement.codePatternSuggestions', true),
                bestPracticesInjection: config.get('promptEnhancement.bestPracticesInjection', true),
                securityChecks: config.get('promptEnhancement.securityChecks', true)
            }
        };
    }
}
