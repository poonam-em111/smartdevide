import * as vscode from 'vscode';
import { RoleManager } from './roleManager';
import { ModelManager } from './models/modelManager';
import { PromptEnhancer } from './prompt/promptEnhancer';
import { DemoPanel } from './demoPanel';
import { generateCode } from './ai/codeGenerator';
import { SmartDevInlineProvider } from './ai/inlineCompletionProvider';
import { SmartDevCodeActionsProvider, runFixWithAI, runExplainWithAI, FixExplainArgs } from './ai/codeActionsProvider';
import { getProjectStyle, getWorkspaceRootForDocument } from './ai/projectStyle';
import { runSecurityReview } from './ai/securityReview';
import {
    generateUnitTests,
    generateEdgeCases,
    flagUntestedOrRisky,
    runStaticChecks,
    showStaticCheckResults
} from './ai/testingValidation';

let roleManager: RoleManager;
let modelManager: ModelManager;
let promptEnhancer: PromptEnhancer;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('SmartDevIDE');
    try {
        outputChannel.appendLine('SmartDevIDE activating...');
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

    // Register generate code command (AI-powered, inserts into editor)
    const generateCodeCommand = vscode.commands.registerCommand(
        'smartdevide.generateCode',
        async () => {
            const editor = vscode.window.activeTextEditor;
            let userPrompt = editor?.document.getText(editor.selection)?.trim() || '';

            if (!userPrompt) {
                const input = await vscode.window.showInputBox({
                    prompt: 'Generate code (AI)',
                    placeHolder: 'e.g., Create a user registration form...',
                    value: '',
                    ignoreFocusOut: true
                });
                if (!input?.trim()) { return; }
                userPrompt = input.trim();
            }

            const role = roleManager.getCurrentRole();
            const modelId = modelManager.getCurrentModel();
            const modelDetails = modelManager.getModelById(modelId);

            if (modelDetails?.provider !== 'openai') {
                vscode.window.showWarningMessage(
                    'SmartDevIDE Generate Code currently uses OpenAI. Set your model to an OpenAI model (e.g. GPT-4 Turbo) and add your API key in Settings.',
                    'Open Settings'
                ).then(choice => {
                    if (choice === 'Open Settings') {
                        vscode.commands.executeCommand('workbench.action.openSettings', 'smartdevide.models.openai');
                    }
                });
                return;
            }

            const useEnhancement = vscode.workspace.getConfiguration('smartdevide').get<boolean>('autoPromptEnhancement', true);
            let enhancedPrompt: string | undefined;
            if (useEnhancement) {
                const enhanced = await promptEnhancer.enhancePrompt(userPrompt, role, modelId);
                enhancedPrompt = enhanced.enhancedPrompt;
            }

            const workspaceRoot = editor ? getWorkspaceRootForDocument(editor.document) : undefined;
            const projectStyle = workspaceRoot ? await getProjectStyle(workspaceRoot) : '';

            let result: { content: string; error?: string };
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: `SmartDevIDE: Generating code (${role})...`,
                    cancellable: false
                },
                async () => {
                    result = await generateCode(userPrompt, role, modelId, enhancedPrompt, projectStyle);
                }
            );

            if (result!.error) {
                vscode.window.showErrorMessage(`SmartDevIDE: ${result!.error}`);
                return;
            }
            if (!result!.content) {
                vscode.window.showWarningMessage('SmartDevIDE: No content generated.');
                return;
            }

            const targetEditor = vscode.window.activeTextEditor;
            if (targetEditor) {
                const hasSelection = !targetEditor.selection.isEmpty;
                await targetEditor.edit(editBuilder => {
                    if (hasSelection) {
                        editBuilder.replace(targetEditor.selection, result!.content);
                    } else {
                        editBuilder.insert(targetEditor.selection.active, result!.content);
                    }
                });
                vscode.window.showInformationMessage(`SmartDevIDE: Code inserted (${modelDetails?.displayName || modelId}).`);
                // Offer testing & validation after generating code
                const testingChoice = await vscode.window.showQuickPick(
                    [
                        { label: '$(beaker) Generate unit tests', value: 'unit' },
                        { label: '$(symbol-event) Generate edge cases', value: 'edge' },
                        { label: '$(check-all) Run static checks', value: 'static' },
                        { label: '$(warning) Flag untested/risky logic', value: 'flag' },
                        { label: '$(close) Nothing', value: 'none' }
                    ],
                    { title: 'Testing & validation', placeHolder: 'Optional: add tests or run checks...' }
                );
                if (testingChoice && testingChoice.value !== 'none' && targetEditor.document === vscode.window.activeTextEditor?.document) {
                    const doc = vscode.window.activeTextEditor.document;
                    const range = vscode.window.activeTextEditor.selection.isEmpty ? undefined : vscode.window.activeTextEditor.selection;
                    const workspaceRoot = getWorkspaceRootForDocument(doc);
                    if (testingChoice.value === 'unit') {
                        const tests = await generateUnitTests(doc, range, () => modelManager.getCurrentModel(), outputChannel);
                        if (tests) {
                            const testDoc = await vscode.workspace.openTextDocument({ content: tests, language: doc.languageId });
                            await vscode.window.showTextDocument(testDoc, { viewColumn: vscode.ViewColumn.Beside });
                        }
                    } else if (testingChoice.value === 'edge') {
                        const tests = await generateEdgeCases(doc, range, () => modelManager.getCurrentModel(), outputChannel);
                        if (tests) {
                            const testDoc = await vscode.workspace.openTextDocument({ content: tests, language: doc.languageId });
                            await vscode.window.showTextDocument(testDoc, { viewColumn: vscode.ViewColumn.Beside });
                        }
                    } else if (testingChoice.value === 'static' && workspaceRoot) {
                        const checkResults = await runStaticChecks(workspaceRoot, doc, outputChannel);
                        showStaticCheckResults(checkResults, outputChannel);
                    } else if (testingChoice.value === 'flag') {
                        await flagUntestedOrRisky(doc, range, () => modelManager.getCurrentModel(), outputChannel);
                    }
                }
            } else {
                const doc = await vscode.workspace.openTextDocument({ content: result!.content, language: 'plaintext' });
                await vscode.window.showTextDocument(doc);
            }
        }
    );

    // Register generate solution command (demo panel)
    const generateSolutionCommand = vscode.commands.registerCommand(
        'smartdevide.generateSolution',
        async () => {
            const role = roleManager.getCurrentRole();
            const model = modelManager.getCurrentModel();

            vscode.window.showInformationMessage(
                `Generating solution with ${role} using ${model}`
            );

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
                '- SmartDevIDE: Generate Code',
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

    // Inline completion (ghost text) provider for code suggestions as you type
    const inlineProvider = new SmartDevInlineProvider(
        () => roleManager.getCurrentRole(),
        () => modelManager.getCurrentModel(),
        outputChannel
    );
    context.subscriptions.push(
        vscode.languages.registerInlineCompletionItemProvider(
            { pattern: '**/*' },
            inlineProvider
        )
    );
    outputChannel.appendLine('SmartDevIDE: Inline completion (auto-suggest) registered.');

    // Code actions: Fix with AI and Explain (Quick Fix menu on errors/warnings)
    const codeActionsProvider = new SmartDevCodeActionsProvider(
        () => roleManager.getCurrentRole(),
        () => modelManager.getCurrentModel(),
        outputChannel
    );
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { pattern: '**/*' },
            codeActionsProvider,
            { providedCodeActionKinds: [SmartDevCodeActionsProvider.fixKind, SmartDevCodeActionsProvider.explainKind] }
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('smartdevide.fixWithAI', (args: FixExplainArgs) =>
            runFixWithAI(args, () => roleManager.getCurrentRole(), () => modelManager.getCurrentModel(), outputChannel)
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('smartdevide.explainWithAI', (args: FixExplainArgs) =>
            runExplainWithAI(args, () => roleManager.getCurrentRole(), () => modelManager.getCurrentModel(), outputChannel)
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('smartdevide.securityReview', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('SmartDevIDE: Open a file first, then run Security Review.');
                return;
            }
            const range = editor.selection.isEmpty ? undefined : editor.selection;
            await runSecurityReview(editor.document, range, () => modelManager.getCurrentModel(), outputChannel);
        })
    );

    // Testing & validation commands
    context.subscriptions.push(
        vscode.commands.registerCommand('smartdevide.generateUnitTests', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('SmartDevIDE: Open a file (or select code) first.');
                return;
            }
            const range = editor.selection.isEmpty ? undefined : editor.selection;
            const tests = await generateUnitTests(editor.document, range, () => modelManager.getCurrentModel(), outputChannel);
            if (tests) {
                const doc = await vscode.workspace.openTextDocument({ content: tests, language: editor.document.languageId });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('smartdevide.generateEdgeCases', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('SmartDevIDE: Open a file (or select code) first.');
                return;
            }
            const range = editor.selection.isEmpty ? undefined : editor.selection;
            const tests = await generateEdgeCases(editor.document, range, () => modelManager.getCurrentModel(), outputChannel);
            if (tests) {
                const doc = await vscode.workspace.openTextDocument({ content: tests, language: editor.document.languageId });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('smartdevide.runStaticChecks', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('SmartDevIDE: Open a file first.');
                return;
            }
            const workspaceRoot = getWorkspaceRootForDocument(editor.document);
            if (!workspaceRoot) {
                vscode.window.showWarningMessage('SmartDevIDE: No workspace folder found.');
                return;
            }
            const results = await runStaticChecks(workspaceRoot, editor.document, outputChannel);
            showStaticCheckResults(results, outputChannel);
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('smartdevide.flagUntestedRisky', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('SmartDevIDE: Open a file (or select code) first.');
                return;
            }
            const range = editor.selection.isEmpty ? undefined : editor.selection;
            await flagUntestedOrRisky(editor.document, range, () => modelManager.getCurrentModel(), outputChannel);
        })
    );

    // Add all commands to subscriptions
    context.subscriptions.push(
        selectRoleCommand,
        selectModelCommand,
        autoDetectRoleCommand,
        generateCodeCommand,
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
        outputChannel.appendLine('SmartDevIDE activated successfully.');
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : '';
        outputChannel.appendLine(`Activation error: ${msg}`);
        if (stack) { outputChannel.appendLine(stack); }
        console.error('SmartDevIDE failed to activate:', err);
        vscode.window.showErrorMessage(`SmartDevIDE failed to load: ${msg}. Open Output (View > Output) and select "SmartDevIDE" for details.`);
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
