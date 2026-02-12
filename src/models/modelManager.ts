import * as vscode from 'vscode';
import { Model, ModelProvider, ModelProviderConfig, ExtensionConfig } from '../types';
import { AVAILABLE_MODELS } from '../config/defaults';
import { DEFAULT_OPENAI_API_KEY } from '../config/defaults';

export class ModelManager {
    private static readonly MODEL_KEY = 'smartdevide.selectedModel';
    private context: vscode.ExtensionContext;
    private currentModel: string;
    private statusBarItem: vscode.StatusBarItem | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.currentModel = this.loadSelectedModel();
        
        const config = this.getConfig();
        if (config.showModelInStatusBar) {
            this.createStatusBarItem();
        }
    }

    /**
     * Get current selected model
     */
    getCurrentModel(): string {
        return this.currentModel;
    }

    /**
     * Get model details by ID
     */
    getModelById(modelId: string): Model | undefined {
        return AVAILABLE_MODELS.find(m => m.id === modelId);
    }

    /**
     * Get all available models
     */
    getAvailableModels(): Model[] {
        const config = this.getConfig();
        return AVAILABLE_MODELS.filter(model => {
            const providerConfig = config.models[model.provider];
            return providerConfig?.enabled ?? false;
        });
    }

    /**
     * Get models by provider
     */
    getModelsByProvider(provider: ModelProvider): Model[] {
        return AVAILABLE_MODELS.filter(m => m.provider === provider);
    }

    /**
     * Select a model
     */
    async selectModel(): Promise<void> {
        const availableModels = this.getAvailableModels();
        
        if (availableModels.length === 0) {
            vscode.window.showWarningMessage(
                'No AI models configured. Please configure at least one model provider in settings.',
                'Open Settings'
            ).then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'smartdevide.models');
                }
            });
            return;
        }

        interface ModelQuickPickItem extends vscode.QuickPickItem {
            model: Model;
        }

        const items: ModelQuickPickItem[] = availableModels.map(model => ({
            label: model.displayName,
            description: model.provider.toUpperCase(),
            detail: `${model.description} - Context: ${model.contextWindow.toLocaleString()} tokens`,
            model: model
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select AI model',
            title: 'SmartDevIDE - Model Selection',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (selected) {
            await this.setModel(selected.model.id);
            vscode.window.showInformationMessage(`Model set to: ${selected.model.displayName}`);
        }
    }

    /**
     * Set current model
     */
    async setModel(modelId: string): Promise<void> {
        const model = this.getModelById(modelId);
        if (!model) {
            throw new Error(`Model not found: ${modelId}`);
        }

        // Check if provider is enabled
        const config = this.getConfig();
        const providerConfig = config.models[model.provider];
        if (!providerConfig?.enabled) {
            vscode.window.showWarningMessage(
                `Provider ${model.provider} is not configured. Please configure it in settings.`,
                'Open Settings'
            ).then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', `smartdevide.models.${model.provider}`);
                }
            });
            return;
        }

        this.currentModel = modelId;
        await this.context.globalState.update(ModelManager.MODEL_KEY, modelId);
        this.updateStatusBar();
    }

    /**
     * Check if a provider is configured
     */
    isProviderConfigured(provider: ModelProvider): boolean {
        const config = this.getConfig();
        const providerConfig = config.models[provider];
        
        if (!providerConfig || !providerConfig.enabled) {
            return false;
        }

        // Check if API key is required and present
        if (provider !== 'cursor' && provider !== 'local') {
            return !!providerConfig.apiKey;
        }

        return true;
    }

    /**
     * Get provider configuration
     */
    getProviderConfig(provider: ModelProvider): ModelProviderConfig | undefined {
        const config = this.getConfig();
        return config.models[provider];
    }

    /**
     * Calculate cost for token usage
     */
    calculateCost(modelId: string, inputTokens: number, outputTokens: number): number | undefined {
        const model = this.getModelById(modelId);
        if (!model || !model.pricing) {
            return undefined;
        }

        const inputCost = (inputTokens / 1_000_000) * model.pricing.input;
        const outputCost = (outputTokens / 1_000_000) * model.pricing.output;

        return inputCost + outputCost;
    }

    /**
     * Get model capabilities
     */
    getModelCapabilities(modelId: string): string[] | undefined {
        const model = this.getModelById(modelId);
        return model?.capabilities;
    }

    /**
     * Validate model selection
     */
    validateModel(modelId: string): { valid: boolean; error?: string } {
        const model = this.getModelById(modelId);
        
        if (!model) {
            return { valid: false, error: 'Model not found' };
        }

        if (!this.isProviderConfigured(model.provider)) {
            return { valid: false, error: `Provider ${model.provider} not configured` };
        }

        return { valid: true };
    }

    /**
     * Get recommended model for task
     */
    getRecommendedModel(taskType: 'coding' | 'reasoning' | 'general' | 'long-context'): Model | undefined {
        const availableModels = this.getAvailableModels();
        
        const suitableModels = availableModels.filter(model => 
            model.capabilities.includes(taskType)
        );

        if (suitableModels.length === 0) {
            return availableModels[0]; // Return first available model
        }

        // Sort by context window and return the best one
        suitableModels.sort((a, b) => b.contextWindow - a.contextWindow);
        return suitableModels[0];
    }

    /**
     * Create status bar item
     */
    private createStatusBarItem(): void {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            99
        );
        this.statusBarItem.command = 'smartdevide.selectModel';
        this.updateStatusBar();
        this.statusBarItem.show();
    }

    /**
     * Update status bar display
     */
    private updateStatusBar(): void {
        if (!this.statusBarItem) {
            return;
        }

        const model = this.getModelById(this.currentModel);
        if (model) {
            this.statusBarItem.text = `🤖 ${model.displayName}`;
            this.statusBarItem.tooltip = `Current AI Model: ${model.displayName}\\nProvider: ${model.provider}\\nClick to change`;
        } else {
            this.statusBarItem.text = '🤖 No Model';
            this.statusBarItem.tooltip = 'Click to select AI model';
        }
    }

    /**
     * Load selected model from storage
     */
    private loadSelectedModel(): string {
        const config = this.getConfig();
        const saved = this.context.globalState.get<string>(ModelManager.MODEL_KEY);
        return saved || config.defaultModel;
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
            models: {
                openai: {
                    id: 'openai',
                    name: 'OpenAI',
                    apiKey: (config.get('models.openai.apiKey') as string)?.trim() || (DEFAULT_OPENAI_API_KEY && (DEFAULT_OPENAI_API_KEY as string).trim()) || undefined,
                    organization: config.get('models.openai.organization'),
                    enabled: config.get('models.openai.enabled', false) || !!(DEFAULT_OPENAI_API_KEY && (DEFAULT_OPENAI_API_KEY as string).trim()),
                    defaultModel: config.get('models.openai.defaultModel', 'gpt-4-turbo')
                },
                anthropic: {
                    id: 'anthropic',
                    name: 'Anthropic',
                    apiKey: config.get('models.anthropic.apiKey'),
                    enabled: config.get('models.anthropic.enabled', false),
                    defaultModel: config.get('models.anthropic.defaultModel', 'claude-3-sonnet')
                },
                google: {
                    id: 'google',
                    name: 'Google',
                    apiKey: config.get('models.google.apiKey'),
                    enabled: config.get('models.google.enabled', false),
                    defaultModel: config.get('models.google.defaultModel', 'gemini-pro')
                },
                cursor: {
                    id: 'cursor',
                    name: 'Cursor',
                    enabled: config.get('models.cursor.enabled', true),
                    defaultModel: config.get('models.cursor.defaultModel', 'cursor-default')
                }
            },
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

    /**
     * Dispose of resources
     */
    dispose(): void {
        this.statusBarItem?.dispose();
    }
}
