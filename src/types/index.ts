// Core type definitions for SmartDevIDE

export enum DeveloperRole {
    BACKEND = 'Backend Developer',
    LARAVEL = 'Laravel Developer',
    COREPHP = 'Core PHP Developer',
    REACT = 'React Developer',
    FRONTEND = 'Frontend Developer',
    QA = 'QA Engineer',
    TECHLEAD = 'Tech Lead',
    PM = 'Project Manager'
}

export type RoleCode = 'backend' | 'laravel' | 'corephp' | 'react' | 'frontend' | 'qa' | 'techlead' | 'pm';

export interface RoleMetadata {
    code: RoleCode;
    name: string;
    icon: string;
    description: string;
    focusAreas: string[];
    filePatterns: string[];
    promptBias: string;
}

// Model System Types
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'cursor' | 'local';

export interface Model {
    id: string;
    name: string;
    displayName: string;
    provider: ModelProvider;
    description: string;
    capabilities: string[];
    contextWindow: number;
    pricing?: {
        input: number;  // per 1M tokens
        output: number; // per 1M tokens
    };
    maxTokens?: number;
    supportsStreaming: boolean;
    supportsFunctions: boolean;
}

export interface ModelProviderConfig {
    id: ModelProvider;
    name: string;
    apiKey?: string;
    organization?: string;
    endpoint?: string;
    defaultModel?: string;
    enabled: boolean;
}

// Prompt Enhancement Types
export interface PromptEnhancementConfig {
    enabled: boolean;
    contextAwareness: boolean;
    roleBasedEnhancement: boolean;
    codePatternSuggestions: boolean;
    bestPracticesInjection: boolean;
    securityChecks: boolean;
}

export interface EnhancedPrompt {
    originalPrompt: string;
    enhancedPrompt: string;
    context: PromptContext;
    role: DeveloperRole;
    model: string;
    enhancements: Enhancement[];
}

export interface PromptContext {
    currentFile?: string;
    fileType?: string;
    projectType?: string;
    recentFiles: string[];
    openFiles: string[];
    selectedCode?: string;
    cursorPosition?: { line: number; character: number };
    workspaceRoot?: string;
}

export interface Enhancement {
    type: 'context' | 'role' | 'pattern' | 'security' | 'bestpractice';
    description: string;
    impact: 'low' | 'medium' | 'high';
    addedContent?: string;
}

// Configuration Types
export interface ExtensionConfig {
    defaultRole: RoleCode;
    defaultModel: string;
    autoPromptEnhancement: boolean;
    contextAwareness: boolean;
    roleAutoSwitch: boolean;
    showRoleInStatusBar: boolean;
    showModelInStatusBar: boolean;
    telemetryEnabled: boolean;
    models: {
        [key in ModelProvider]?: ModelProviderConfig;
    };
    promptEnhancement: PromptEnhancementConfig;
}

export interface ProjectConfig {
    preferredRole?: RoleCode;
    preferredModel?: string;
    projectType?: string;
    framework?: string;
    conventions?: {
        codingStyle?: string;
        testFramework?: string;
        namespaces?: string[];
    };
    customInstructions?: string;
}

// Template Types
export interface CodeTemplate {
    userCreation: string;
    restApi: string;
    authentication: string;
    optimization: string;
    [key: string]: string; // Allow custom templates
}

export interface RoleTemplate {
    role: DeveloperRole;
    code: RoleCode;
    templates: CodeTemplate;
    systemPrompt: string;
    contextInstructions: string;
    bestPractices: string[];
    codePatterns: string[];
}

// AI Response Types
export interface AIRequest {
    prompt: string;
    model: string;
    role: DeveloperRole;
    context?: PromptContext;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

export interface AIResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cost?: number;
    };
    metadata?: {
        role: DeveloperRole;
        enhanced: boolean;
        responseTime: number;
    };
}

// UI State Types
export interface UIState {
    selectedRole: DeveloperRole;
    selectedModel: string;
    panelVisible: boolean;
    settingsVisible: boolean;
}

// IDE Adapter Types
export type IDEType = 'vscode' | 'cursor';

export interface IDEAdapter {
    type: IDEType;
    getActiveFile(): string | undefined;
    getWorkspaceRoot(): string | undefined;
    getOpenFiles(): string[];
    getSelectedText(): string | undefined;
    getCursorPosition(): { line: number; character: number } | undefined;
    showMessage(message: string, type: 'info' | 'warning' | 'error'): void;
    showQuickPick<T>(items: T[], options?: any): Promise<T | undefined>;
}

// Telemetry Types
export interface TelemetryEvent {
    event: string;
    properties?: Record<string, any>;
    timestamp: number;
}

export interface UsageMetrics {
    roleUsage: Record<RoleCode, number>;
    modelUsage: Record<string, number>;
    promptEnhancementAcceptance: number;
    averageResponseTime: number;
    totalRequests: number;
}
