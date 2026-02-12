"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_PROVIDER_NAMES = exports.ROLE_ICON_MAP = exports.DEFAULT_CONFIG = exports.AVAILABLE_MODELS = exports.DEFAULT_ROLES = exports.DEFAULT_OPENAI_API_KEY = void 0;
/** Built-in OpenAI API key when user does not set one. Set in Settings (smartdevide.models.openai.apiKey) for out-of-the-box use. Do not commit real keys. */
exports.DEFAULT_OPENAI_API_KEY = '';
exports.DEFAULT_ROLES = [
    {
        code: 'backend',
        name: 'Backend Developer',
        icon: '🔧',
        description: 'Focus on server-side logic, APIs, databases, and scalability',
        focusAreas: ['APIs', 'Databases', 'Architecture', 'Performance', 'Security'],
        filePatterns: ['*.controller.ts', '*.service.ts', '*.repository.ts', 'routes/*'],
        promptBias: 'Production-ready code with error handling, transactions, caching, and scalability considerations'
    },
    {
        code: 'laravel',
        name: 'Laravel Developer',
        icon: '🎸',
        description: 'Laravel framework expertise with Eloquent, Blade, and ecosystem',
        focusAreas: ['Eloquent ORM', 'Blade Templates', 'Artisan', 'Middleware', 'Laravel Packages'],
        filePatterns: ['*.php', 'app/*', 'routes/*.php', 'resources/views/*.blade.php'],
        promptBias: 'Laravel conventions, Eloquent patterns, service containers, and framework best practices'
    },
    {
        code: 'corephp',
        name: 'Core PHP Developer',
        icon: '🐘',
        description: 'Pure PHP without frameworks, focusing on performance and fundamentals',
        focusAreas: ['PHP Core', 'Performance', 'Security', 'PDO', 'Sessions'],
        filePatterns: ['*.php', 'index.php', 'config.php'],
        promptBias: 'Clean, efficient PHP code without framework dependencies, focusing on performance and security'
    },
    {
        code: 'react',
        name: 'React Developer',
        icon: '⚛️',
        description: 'React specialist with hooks, state management, and modern patterns',
        focusAreas: ['React Hooks', 'State Management', 'Component Design', 'TypeScript', 'Performance'],
        filePatterns: ['*.tsx', '*.jsx', 'components/*', 'hooks/*'],
        promptBias: 'Modern React patterns with hooks, TypeScript, proper state management, and component composition'
    },
    {
        code: 'frontend',
        name: 'Frontend Developer',
        icon: '🎨',
        description: 'UI/UX focused with styling, accessibility, and user experience',
        focusAreas: ['UI/UX', 'Responsive Design', 'Accessibility', 'CSS', 'User Experience'],
        filePatterns: ['*.html', '*.css', '*.scss', '*.tsx', '*.jsx'],
        promptBias: 'User-friendly interfaces with accessibility, responsive design, and excellent UX'
    },
    {
        code: 'qa',
        name: 'QA Engineer',
        icon: '🧪',
        description: 'Testing, validation, security, and quality assurance',
        focusAreas: ['Testing', 'Edge Cases', 'Security', 'Validation', 'Coverage'],
        filePatterns: ['*.test.ts', '*.spec.ts', '__tests__/*', 'tests/*'],
        promptBias: 'Comprehensive test coverage with edge cases, security validation, and quality assurance'
    },
    {
        code: 'techlead',
        name: 'Tech Lead',
        icon: '🏗️',
        description: 'Architecture, system design, and technical decision-making',
        focusAreas: ['Architecture', 'System Design', 'Trade-offs', 'Scalability', 'Team Leadership'],
        filePatterns: ['*'],
        promptBias: 'Architectural decisions with trade-off analysis, scalability planning, and system design'
    },
    {
        code: 'pm',
        name: 'Project Manager',
        icon: '📋',
        description: 'Planning, documentation, coordination, and project management',
        focusAreas: ['Planning', 'Documentation', 'Requirements', 'Coordination', 'Timelines'],
        filePatterns: ['*.md', 'README*', 'CHANGELOG*', 'docs/*'],
        promptBias: 'Clear documentation, project planning, requirement analysis, and stakeholder communication'
    }
];
exports.AVAILABLE_MODELS = [
    // OpenAI Models
    {
        id: 'gpt-4-turbo',
        name: 'gpt-4-turbo-preview',
        displayName: 'GPT-4 Turbo',
        provider: 'openai',
        description: 'Most capable model, best for complex tasks',
        capabilities: ['coding', 'reasoning', 'analysis'],
        contextWindow: 128000,
        pricing: { input: 10, output: 30 },
        maxTokens: 4096,
        supportsStreaming: true,
        supportsFunctions: true
    },
    {
        id: 'gpt-4',
        name: 'gpt-4',
        displayName: 'GPT-4',
        provider: 'openai',
        description: 'Reliable and powerful for most tasks',
        capabilities: ['coding', 'reasoning', 'analysis'],
        contextWindow: 8192,
        pricing: { input: 30, output: 60 },
        maxTokens: 4096,
        supportsStreaming: true,
        supportsFunctions: true
    },
    {
        id: 'gpt-3.5-turbo',
        name: 'gpt-3.5-turbo',
        displayName: 'GPT-3.5 Turbo',
        provider: 'openai',
        description: 'Fast and cost-effective',
        capabilities: ['coding', 'general'],
        contextWindow: 16385,
        pricing: { input: 0.5, output: 1.5 },
        maxTokens: 4096,
        supportsStreaming: true,
        supportsFunctions: true
    },
    // Anthropic Models
    {
        id: 'claude-3-opus',
        name: 'claude-3-opus-20240229',
        displayName: 'Claude 3 Opus',
        provider: 'anthropic',
        description: 'Most intelligent, best for complex analysis',
        capabilities: ['coding', 'reasoning', 'analysis', 'long-context'],
        contextWindow: 200000,
        pricing: { input: 15, output: 75 },
        maxTokens: 4096,
        supportsStreaming: true,
        supportsFunctions: true
    },
    {
        id: 'claude-3-sonnet',
        name: 'claude-3-sonnet-20240229',
        displayName: 'Claude 3 Sonnet',
        provider: 'anthropic',
        description: 'Balanced performance and cost',
        capabilities: ['coding', 'reasoning', 'analysis'],
        contextWindow: 200000,
        pricing: { input: 3, output: 15 },
        maxTokens: 4096,
        supportsStreaming: true,
        supportsFunctions: true
    },
    {
        id: 'claude-3-haiku',
        name: 'claude-3-haiku-20240307',
        displayName: 'Claude 3 Haiku',
        provider: 'anthropic',
        description: 'Fast and affordable',
        capabilities: ['coding', 'general'],
        contextWindow: 200000,
        pricing: { input: 0.25, output: 1.25 },
        maxTokens: 4096,
        supportsStreaming: true,
        supportsFunctions: true
    },
    // Google Models
    {
        id: 'gemini-pro',
        name: 'gemini-pro',
        displayName: 'Gemini Pro',
        provider: 'google',
        description: 'Google\'s advanced AI model',
        capabilities: ['coding', 'reasoning', 'multimodal'],
        contextWindow: 32768,
        pricing: { input: 0.5, output: 1.5 },
        maxTokens: 2048,
        supportsStreaming: true,
        supportsFunctions: true
    },
    // Cursor Models
    {
        id: 'cursor-default',
        name: 'cursor-default',
        displayName: 'Cursor Default',
        provider: 'cursor',
        description: 'Cursor\'s native AI model',
        capabilities: ['coding', 'ide-integration'],
        contextWindow: 100000,
        maxTokens: 4096,
        supportsStreaming: true,
        supportsFunctions: false
    }
];
exports.DEFAULT_CONFIG = {
    defaultRole: 'backend',
    defaultModel: 'gpt-4-turbo',
    autoPromptEnhancement: true,
    contextAwareness: true,
    roleAutoSwitch: false,
    showRoleInStatusBar: true,
    showModelInStatusBar: true,
    telemetryEnabled: true,
    models: {
        openai: {
            id: 'openai',
            name: 'OpenAI',
            enabled: false,
            defaultModel: 'gpt-4-turbo'
        },
        anthropic: {
            id: 'anthropic',
            name: 'Anthropic',
            enabled: false,
            defaultModel: 'claude-3-sonnet'
        },
        google: {
            id: 'google',
            name: 'Google',
            enabled: false,
            defaultModel: 'gemini-pro'
        },
        cursor: {
            id: 'cursor',
            name: 'Cursor',
            enabled: true,
            defaultModel: 'cursor-default'
        }
    },
    promptEnhancement: {
        enabled: true,
        contextAwareness: true,
        roleBasedEnhancement: true,
        codePatternSuggestions: true,
        bestPracticesInjection: true,
        securityChecks: true
    }
};
exports.ROLE_ICON_MAP = {
    backend: '🔧',
    laravel: '🎸',
    corephp: '🐘',
    react: '⚛️',
    frontend: '🎨',
    qa: '🧪',
    techlead: '🏗️',
    pm: '📋'
};
exports.MODEL_PROVIDER_NAMES = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    cursor: 'Cursor',
    local: 'Local'
};
//# sourceMappingURL=defaults.js.map