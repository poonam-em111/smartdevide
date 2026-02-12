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
let roleManager;
let modelManager;
let promptEnhancer;
function activate(context) {
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
    // Register generate solution command
    const generateSolutionCommand = vscode.commands.registerCommand('smartdevide.generateSolution', async () => {
        const role = roleManager.getCurrentRole();
        const model = modelManager.getCurrentModel();
        vscode.window.showInformationMessage(`Generating solution with ${role} using ${model}`);
        // Show demo panel for POC
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
    // Add all commands to subscriptions
    context.subscriptions.push(selectRoleCommand, selectModelCommand, autoDetectRoleCommand, openDemoCommand, generateSolutionCommand, enhancePromptCommand, openSettingsCommand, showInfoCommand, roleManager, modelManager);
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