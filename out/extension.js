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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const roleManager_1 = require("./roleManager");
const modelManager_1 = require("./models/modelManager");
const promptEnhancer_1 = require("./prompt/promptEnhancer");
const demoPanel_1 = require("./demoPanel");
const codeGenerator_1 = require("./ai/codeGenerator");
const inlineCompletionProvider_1 = require("./ai/inlineCompletionProvider");
const codeActionsProvider_1 = require("./ai/codeActionsProvider");
const projectStyle_1 = require("./ai/projectStyle");
const securityReview_1 = require("./ai/securityReview");
const testingValidation_1 = require("./ai/testingValidation");
let roleManager;
let modelManager;
let promptEnhancer;
let outputChannel;
function activate(context) {
    outputChannel = vscode.window.createOutputChannel('SmartDevIDE');
    try {
        outputChannel.appendLine('SmartDevIDE activating...');
        console.log('SmartDevIDE extension is now active!');
        // Initialize core managers
        roleManager = new roleManager_1.RoleManager(context);
        modelManager = new modelManager_1.ModelManager(context);
        promptEnhancer = new promptEnhancer_1.PromptEnhancer(context);
        // Register role selection command
        const selectRoleCommand = vscode.commands.registerCommand('smartdevide.selectRole', async () => {
            await roleManager.selectRole();
        });
        // Register model selection command
        const selectModelCommand = vscode.commands.registerCommand('smartdevide.selectModel', async () => {
            await modelManager.selectModel();
        });
        // Register auto-detect role command
        const autoDetectRoleCommand = vscode.commands.registerCommand('smartdevide.autoDetectRole', async () => {
            const detectedRole = await roleManager.autoDetectRole();
            if (detectedRole) {
                const response = await vscode.window.showInformationMessage(`Detected role: ${detectedRole}. Would you like to switch to this role?`, 'Yes', 'No');
                if (response === 'Yes') {
                    await roleManager.setRole(detectedRole);
                }
            }
            else {
                vscode.window.showInformationMessage('Could not auto-detect role from current file.');
            }
        });
        // Register demo panel command
        const openDemoCommand = vscode.commands.registerCommand('smartdevide.openDemo', () => {
            demoPanel_1.DemoPanel.show(context.extensionUri, () => roleManager.getCurrentRole());
        });
        // Register generate code command (AI-powered, inserts into editor)
        const generateCodeCommand = vscode.commands.registerCommand('smartdevide.generateCode', async () => {
            const editor = vscode.window.activeTextEditor;
            let userPrompt = editor?.document.getText(editor.selection)?.trim() || '';
            if (!userPrompt) {
                const input = await vscode.window.showInputBox({
                    prompt: 'Generate code (AI)',
                    placeHolder: 'e.g., Create a user registration form...',
                    value: '',
                    ignoreFocusOut: true
                });
                if (!input?.trim()) {
                    return;
                }
                userPrompt = input.trim();
            }
            const role = roleManager.getCurrentRole();
            const modelId = modelManager.getCurrentModel();
            const modelDetails = modelManager.getModelById(modelId);
            if (modelDetails?.provider !== 'openai') {
                vscode.window.showWarningMessage('SmartDevIDE Generate Code currently uses OpenAI. Set your model to an OpenAI model (e.g. GPT-4 Turbo) and add your API key in Settings.', 'Open Settings').then(choice => {
                    if (choice === 'Open Settings') {
                        vscode.commands.executeCommand('workbench.action.openSettings', 'smartdevide.models.openai');
                    }
                });
                return;
            }
            const useEnhancement = vscode.workspace.getConfiguration('smartdevide').get('autoPromptEnhancement', true);
            let enhancedPrompt;
            if (useEnhancement) {
                const enhanced = await promptEnhancer.enhancePrompt(userPrompt, role, modelId);
                enhancedPrompt = enhanced.enhancedPrompt;
            }
            const workspaceRoot = editor ? (0, projectStyle_1.getWorkspaceRootForDocument)(editor.document) : undefined;
            const projectStyle = workspaceRoot ? await (0, projectStyle_1.getProjectStyle)(workspaceRoot) : '';
            let result;
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `SmartDevIDE: Generating code (${role})...`,
                cancellable: false
            }, async () => {
                result = await (0, codeGenerator_1.generateCode)(userPrompt, role, modelId, enhancedPrompt, projectStyle);
            });
            if (result.error) {
                vscode.window.showErrorMessage(`SmartDevIDE: ${result.error}`);
                return;
            }
            if (!result.content) {
                vscode.window.showWarningMessage('SmartDevIDE: No content generated.');
                return;
            }
            const targetEditor = vscode.window.activeTextEditor;
            if (targetEditor) {
                const hasSelection = !targetEditor.selection.isEmpty;
                await targetEditor.edit(editBuilder => {
                    if (hasSelection) {
                        editBuilder.replace(targetEditor.selection, result.content);
                    }
                    else {
                        editBuilder.insert(targetEditor.selection.active, result.content);
                    }
                });
                vscode.window.showInformationMessage(`SmartDevIDE: Code inserted (${modelDetails?.displayName || modelId}).`);
                // Offer testing & validation after generating code
                const testingChoice = await vscode.window.showQuickPick([
                    { label: '$(beaker) Generate unit tests', value: 'unit' },
                    { label: '$(symbol-event) Generate edge cases', value: 'edge' },
                    { label: '$(check-all) Run static checks', value: 'static' },
                    { label: '$(warning) Flag untested/risky logic', value: 'flag' },
                    { label: '$(close) Nothing', value: 'none' }
                ], { title: 'Testing & validation', placeHolder: 'Optional: add tests or run checks...' });
                if (testingChoice && testingChoice.value !== 'none' && targetEditor.document === vscode.window.activeTextEditor?.document) {
                    const doc = vscode.window.activeTextEditor.document;
                    const range = vscode.window.activeTextEditor.selection.isEmpty ? undefined : vscode.window.activeTextEditor.selection;
                    const workspaceRoot = (0, projectStyle_1.getWorkspaceRootForDocument)(doc);
                    if (testingChoice.value === 'unit') {
                        const tests = await (0, testingValidation_1.generateUnitTests)(doc, range, () => modelManager.getCurrentModel(), outputChannel);
                        if (tests) {
                            const testDoc = await vscode.workspace.openTextDocument({ content: tests, language: doc.languageId });
                            await vscode.window.showTextDocument(testDoc, { viewColumn: vscode.ViewColumn.Beside });
                        }
                    }
                    else if (testingChoice.value === 'edge') {
                        const tests = await (0, testingValidation_1.generateEdgeCases)(doc, range, () => modelManager.getCurrentModel(), outputChannel);
                        if (tests) {
                            const testDoc = await vscode.workspace.openTextDocument({ content: tests, language: doc.languageId });
                            await vscode.window.showTextDocument(testDoc, { viewColumn: vscode.ViewColumn.Beside });
                        }
                    }
                    else if (testingChoice.value === 'static' && workspaceRoot) {
                        const checkResults = await (0, testingValidation_1.runStaticChecks)(workspaceRoot, doc, outputChannel);
                        (0, testingValidation_1.showStaticCheckResults)(checkResults, outputChannel);
                    }
                    else if (testingChoice.value === 'flag') {
                        await (0, testingValidation_1.flagUntestedOrRisky)(doc, range, () => modelManager.getCurrentModel(), outputChannel);
                    }
                }
            }
            else {
                const doc = await vscode.workspace.openTextDocument({ content: result.content, language: 'plaintext' });
                await vscode.window.showTextDocument(doc);
            }
        });
        // Register generate solution command (demo panel)
        const generateSolutionCommand = vscode.commands.registerCommand('smartdevide.generateSolution', async () => {
            const role = roleManager.getCurrentRole();
            const model = modelManager.getCurrentModel();
            vscode.window.showInformationMessage(`Generating solution with ${role} using ${model}`);
            demoPanel_1.DemoPanel.show(context.extensionUri, () => roleManager.getCurrentRole());
        });
        // Register prompt enhancement command
        const enhancePromptCommand = vscode.commands.registerCommand('smartdevide.enhancePrompt', async () => {
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
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Enhancing prompt...',
                cancellable: false
            }, async () => {
                const enhanced = await promptEnhancer.enhancePrompt(userPrompt, role, model);
                // Show results
                const showEnhanced = await vscode.window.showInformationMessage(`Prompt enhanced with ${enhanced.enhancements.length} improvements`, 'View Original', 'View Enhanced');
                if (showEnhanced === 'View Original') {
                    const doc = await vscode.workspace.openTextDocument({
                        content: enhanced.originalPrompt,
                        language: 'markdown'
                    });
                    await vscode.window.showTextDocument(doc);
                }
                else if (showEnhanced === 'View Enhanced') {
                    const doc = await vscode.workspace.openTextDocument({
                        content: enhanced.enhancedPrompt,
                        language: 'markdown'
                    });
                    await vscode.window.showTextDocument(doc);
                }
            });
        });
        // Register open settings command
        const openSettingsCommand = vscode.commands.registerCommand('smartdevide.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'smartdevide');
        });
        // Register show info command
        const showInfoCommand = vscode.commands.registerCommand('smartdevide.showInfo', () => {
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
        });
        // Auto-detect role on file open if enabled
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            const config = vscode.workspace.getConfiguration('smartdevide');
            const autoSwitch = config.get('roleAutoSwitch', false);
            if (autoSwitch && editor) {
                const detectedRole = await roleManager.autoDetectRole();
                if (detectedRole && detectedRole !== roleManager.getCurrentRole()) {
                    await roleManager.setRole(detectedRole);
                }
            }
        }));
        // Inline completion (ghost text) provider for code suggestions as you type
        const inlineProvider = new inlineCompletionProvider_1.SmartDevInlineProvider(() => roleManager.getCurrentRole(), () => modelManager.getCurrentModel(), outputChannel);
        context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ pattern: '**/*' }, inlineProvider));
        outputChannel.appendLine('SmartDevIDE: Inline completion (auto-suggest) registered.');
        // Code actions: Fix with AI and Explain (Quick Fix menu on errors/warnings)
        const codeActionsProvider = new codeActionsProvider_1.SmartDevCodeActionsProvider(() => roleManager.getCurrentRole(), () => modelManager.getCurrentModel(), outputChannel);
        context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ pattern: '**/*' }, codeActionsProvider, { providedCodeActionKinds: [codeActionsProvider_1.SmartDevCodeActionsProvider.fixKind, codeActionsProvider_1.SmartDevCodeActionsProvider.explainKind] }));
        context.subscriptions.push(vscode.commands.registerCommand('smartdevide.fixWithAI', (args) => (0, codeActionsProvider_1.runFixWithAI)(args, () => roleManager.getCurrentRole(), () => modelManager.getCurrentModel(), outputChannel)));
        context.subscriptions.push(vscode.commands.registerCommand('smartdevide.explainWithAI', (args) => (0, codeActionsProvider_1.runExplainWithAI)(args, () => roleManager.getCurrentRole(), () => modelManager.getCurrentModel(), outputChannel)));
        context.subscriptions.push(vscode.commands.registerCommand('smartdevide.securityReview', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('SmartDevIDE: Open a file first, then run Security Review.');
                return;
            }
            const range = editor.selection.isEmpty ? undefined : editor.selection;
            await (0, securityReview_1.runSecurityReview)(editor.document, range, () => modelManager.getCurrentModel(), outputChannel);
        }));
        // Testing & validation commands
        context.subscriptions.push(vscode.commands.registerCommand('smartdevide.generateUnitTests', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('SmartDevIDE: Open a file (or select code) first.');
                return;
            }
            const range = editor.selection.isEmpty ? undefined : editor.selection;
            const tests = await (0, testingValidation_1.generateUnitTests)(editor.document, range, () => modelManager.getCurrentModel(), outputChannel);
            if (tests) {
                const doc = await vscode.workspace.openTextDocument({ content: tests, language: editor.document.languageId });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('smartdevide.generateEdgeCases', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('SmartDevIDE: Open a file (or select code) first.');
                return;
            }
            const range = editor.selection.isEmpty ? undefined : editor.selection;
            const tests = await (0, testingValidation_1.generateEdgeCases)(editor.document, range, () => modelManager.getCurrentModel(), outputChannel);
            if (tests) {
                const doc = await vscode.workspace.openTextDocument({ content: tests, language: editor.document.languageId });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('smartdevide.runStaticChecks', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('SmartDevIDE: Open a file first.');
                return;
            }
            const workspaceRoot = (0, projectStyle_1.getWorkspaceRootForDocument)(editor.document);
            if (!workspaceRoot) {
                vscode.window.showWarningMessage('SmartDevIDE: No workspace folder found.');
                return;
            }
            const results = await (0, testingValidation_1.runStaticChecks)(workspaceRoot, editor.document, outputChannel);
            (0, testingValidation_1.showStaticCheckResults)(results, outputChannel);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('smartdevide.flagUntestedRisky', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('SmartDevIDE: Open a file (or select code) first.');
                return;
            }
            const range = editor.selection.isEmpty ? undefined : editor.selection;
            await (0, testingValidation_1.flagUntestedOrRisky)(editor.document, range, () => modelManager.getCurrentModel(), outputChannel);
        }));
        // Add all commands to subscriptions
        context.subscriptions.push(selectRoleCommand, selectModelCommand, autoDetectRoleCommand, generateCodeCommand, openDemoCommand, generateSolutionCommand, enhancePromptCommand, openSettingsCommand, showInfoCommand, roleManager, modelManager);
        // Show welcome message on first activation
        const hasShownWelcome = context.globalState.get('smartdevide.hasShownWelcome');
        if (!hasShownWelcome) {
            vscode.window.showInformationMessage('Welcome to SmartDevIDE! Enhanced AI assistant with role-based behavior and multi-model support.', 'Select Role', 'Select Model', 'Open Demo').then(selection => {
                if (selection === 'Select Role') {
                    vscode.commands.executeCommand('smartdevide.selectRole');
                }
                else if (selection === 'Select Model') {
                    vscode.commands.executeCommand('smartdevide.selectModel');
                }
                else if (selection === 'Open Demo') {
                    vscode.commands.executeCommand('smartdevide.openDemo');
                }
            });
            context.globalState.update('smartdevide.hasShownWelcome', true);
        }
        outputChannel.appendLine('SmartDevIDE activated successfully.');
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : '';
        outputChannel.appendLine(`Activation error: ${msg}`);
        if (stack) {
            outputChannel.appendLine(stack);
        }
        console.error('SmartDevIDE failed to activate:', err);
        vscode.window.showErrorMessage(`SmartDevIDE failed to load: ${msg}. Open Output (View > Output) and select "SmartDevIDE" for details.`);
    }
}
function deactivate() {
    if (roleManager) {
        roleManager.dispose();
    }
    if (modelManager) {
        modelManager.dispose();
    }
}
//# sourceMappingURL=extension.js.map