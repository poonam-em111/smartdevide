import * as vscode from 'vscode';
import { RoleManager } from './roleManager';
import { ModelManager } from './models/modelManager';
import { PromptEnhancer } from './prompt/promptEnhancer';
import { DemoPanel } from './demoPanel';

let roleManager: RoleManager;
let modelManager: ModelManager;
let promptEnhancer: PromptEnhancer;

export function activate(context: vscode.ExtensionContext) {
    console.log('SmartDevIDE extension is now active!');

    // Initialize core managers
    roleManager = new RoleManager(context);
    modelManager = new ModelManager(context);
    promptEnhancer = new PromptEnhancer(context);

    // Register role selection command
    const selectRoleCommand = vscode.commands.registerCommand(
        'smartdevide.selectRole',
        async () => {
            await roleManager.selectRole();
        }
    );

    // Register model selection command
    const selectModelCommand = vscode.commands.registerCommand(
        'smartdevide.selectModel',
        async () => {
            await modelManager.selectModel();
        }
    );

    // Register auto-detect role command
    const autoDetectRoleCommand = vscode.commands.registerCommand(
        'smartdevide.autoDetectRole',
        async () => {
            const detectedRole = await roleManager.autoDetectRole();
            if (detectedRole) {
                const response = await vscode.window.showInformationMessage(
                    `Detected role: ${detectedRole}. Would you like to switch to this role?`,
                    'Yes',
                    'No'
                );
                if (response === 'Yes') {
                    await roleManager.setRole(detectedRole);
                }
            } else {
                vscode.window.showInformationMessage('Could not auto-detect role from current file.');
            }
        }
    );

    // Register demo panel command
    const openDemoCommand = vscode.commands.registerCommand(
        'smartdevide.openDemo',
        () => {
            DemoPanel.show(
                context.extensionUri,
                () => roleManager.getCurrentRole()
            );
        }
    );

    // Register generate solution command
    const generateSolutionCommand = vscode.commands.registerCommand(
        'smartdevide.generateSolution',
        async () => {
            const role = roleManager.getCurrentRole();
            const model = modelManager.getCurrentModel();
            
            vscode.window.showInformationMessage(
                `Generating solution with ${role} using ${model}`
            );

            // Show demo panel for POC
            DemoPanel.show(
                context.extensionUri,
                () => roleManager.getCurrentRole()
            );
        }
    );

    // Register prompt enhancement command
    const enhancePromptCommand = vscode.commands.registerCommand(
        'smartdevide.enhancePrompt',
        async () => {
            const userPrompt = await vscode.window.showInputBox({
                prompt: 'Enter your prompt',
                placeHolder: 'e.g., Create a user registration form...',
                ignoreFocusOut: true
            });

            if (!userPrompt) {
                return;
            }

            const role = roleManager.getCurrentRole();
            const model = modelManager.getCurrentModel();

            // Show loading indicator
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Enhancing prompt...',
                    cancellable: false
                },
                async () => {
                    const enhanced = await promptEnhancer.enhancePrompt(
                        userPrompt,
                        role,
                        model
                    );

                    // Show results
                    const showEnhanced = await vscode.window.showInformationMessage(
                        `Prompt enhanced with ${enhanced.enhancements.length} improvements`,
                        'View Original',
                        'View Enhanced'
                    );

                    if (showEnhanced === 'View Original') {
                        const doc = await vscode.workspace.openTextDocument({
                            content: enhanced.originalPrompt,
                            language: 'markdown'
                        });
                        await vscode.window.showTextDocument(doc);
                    } else if (showEnhanced === 'View Enhanced') {
                        const doc = await vscode.workspace.openTextDocument({
                            content: enhanced.enhancedPrompt,
                            language: 'markdown'
                        });
                        await vscode.window.showTextDocument(doc);
                    }
                }
            );
        }
    );

    // Register open settings command
    const openSettingsCommand = vscode.commands.registerCommand(
        'smartdevide.openSettings',
        () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'smartdevide');
        }
    );

    // Register show info command
    const showInfoCommand = vscode.commands.registerCommand(
        'smartdevide.showInfo',
        () => {
            const role = roleManager.getCurrentRole();
            const roleMetadata = roleManager.getCurrentRoleMetadata();
            const model = modelManager.getCurrentModel();
            const modelDetails = modelManager.getModelById(model);

            const info = [
                '## SmartDevIDE Status',
                '',
                `**Current Role:** ${roleMetadata?.icon} ${role}`,
                `**Focus Areas:** ${roleMetadata?.focusAreas.join(', ')}`,
                '',
                `**Current Model:** ${modelDetails?.displayName || model}`,
                `**Provider:** ${modelDetails?.provider.toUpperCase() || 'Unknown'}`,
                `**Context Window:** ${modelDetails?.contextWindow.toLocaleString() || 'Unknown'} tokens`,
                '',
                '**Available Commands:**',
                '- SmartDevIDE: Select Role',
                '- SmartDevIDE: Select Model',
                '- SmartDevIDE: Auto-Detect Role',
                '- SmartDevIDE: Enhance Prompt',
                '- SmartDevIDE: Open Demo'
            ].join('\\n');

            vscode.workspace.openTextDocument({
                content: info,
                language: 'markdown'
            }).then(doc => {
                vscode.window.showTextDocument(doc);
            });
        }
    );

    // Auto-detect role on file open if enabled
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            const config = vscode.workspace.getConfiguration('smartdevide');
            const autoSwitch = config.get('roleAutoSwitch', false);

            if (autoSwitch && editor) {
                const detectedRole = await roleManager.autoDetectRole();
                if (detectedRole && detectedRole !== roleManager.getCurrentRole()) {
                    await roleManager.setRole(detectedRole);
                }
            }
        })
    );

    // Add all commands to subscriptions
    context.subscriptions.push(
        selectRoleCommand,
        selectModelCommand,
        autoDetectRoleCommand,
        openDemoCommand,
        generateSolutionCommand,
        enhancePromptCommand,
        openSettingsCommand,
        showInfoCommand,
        roleManager,
        modelManager
    );

    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get('smartdevide.hasShownWelcome');
    if (!hasShownWelcome) {
        vscode.window.showInformationMessage(
            'Welcome to SmartDevIDE! Enhanced AI assistant with role-based behavior and multi-model support.',
            'Select Role',
            'Select Model',
            'Open Demo'
        ).then(selection => {
            if (selection === 'Select Role') {
                vscode.commands.executeCommand('smartdevide.selectRole');
            } else if (selection === 'Select Model') {
                vscode.commands.executeCommand('smartdevide.selectModel');
            } else if (selection === 'Open Demo') {
                vscode.commands.executeCommand('smartdevide.openDemo');
            }
        });
        context.globalState.update('smartdevide.hasShownWelcome', true);
    }
}

export function deactivate() {
    if (roleManager) {
        roleManager.dispose();
    }
    if (modelManager) {
        modelManager.dispose();
    }
}
