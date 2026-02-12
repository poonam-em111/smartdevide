# SmartDevIDE - Enhanced Architecture

## 🎯 Vision
Enterprise-grade, cross-IDE AI assistant with role-based behavior, multi-model support, and intelligent prompt enhancement.

## 🏗️ System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     IDE Extension Layer                      │
├─────────────────────────────────────────────────────────────┤
│  VS Code API        │        Cursor API        │    Common   │
├─────────────────────────────────────────────────────────────┤
│                   Extension Core Manager                      │
│  - Lifecycle Management                                       │
│  - Command Registration                                       │
│  - Event Coordination                                         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  Role Manager  │  │  Model Manager  │  │ Prompt Engine   │
│                │  │                 │  │                 │
│ - 7 Roles      │  │ - Multi-Model   │  │ - Enhancement   │
│ - Dynamic      │  │ - Provider API  │  │ - Context       │
│   Switching    │  │ - Config Mgmt   │  │ - Intelligence  │
└────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  AI Service Layer  │
                    │  - OpenAI          │
                    │  - Anthropic       │
                    │  - Google Gemini   │
                    │  - Local Models    │
                    └────────────────────┘
```

## 👥 Enhanced Role System

### Role Definitions

| Role | Code | Focus Areas | Prompt Bias |
|------|------|-------------|-------------|
| **Backend Developer** | `backend` | APIs, databases, architecture | Scalability, security, performance |
| **Laravel Developer** | `laravel` | Laravel framework, Eloquent, Blade | MVC, conventions, packages |
| **Core PHP** | `corephp` | Pure PHP, performance, basics | No framework, efficiency |
| **React Developer** | `react` | Components, hooks, state | Modern patterns, TypeScript |
| **Frontend Developer** | `frontend` | UI/UX, styling, accessibility | User experience, responsive |
| **QA Engineer** | `qa` | Testing, validation, security | Edge cases, coverage |
| **Project Manager** | `pm` | Planning, docs, coordination | Requirements, timelines |

### Role Switching Logic
```typescript
interface RoleContext {
  role: DeveloperRole;
  projectType?: string;
  fileContext?: string[];
  activeFile?: string;
  recentChanges?: string[];
}
```

## 🤖 Multi-Model Architecture

### Supported Models

```typescript
interface ModelProvider {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local' | 'cursor';
  models: Model[];
}

interface Model {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  contextWindow: number;
  pricing?: {
    input: number;  // per 1M tokens
    output: number; // per 1M tokens
  };
}
```

### Provider Configuration
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5
- **Anthropic**: Claude 3 Opus, Sonnet, Haiku
- **Google**: Gemini Pro, Gemini Ultra
- **Cursor**: Native Cursor models
- **Local**: Ollama integration

## 🎨 Prompt Enhancement Engine

### Enhancement Layers

1. **Context Layer**
   - File context injection
   - Project structure awareness
   - Recent changes tracking

2. **Role Layer**
   - Role-specific instructions
   - Best practices injection
   - Pattern recommendations

3. **Intelligence Layer**
   - Intent detection
   - Complexity analysis
   - Output format optimization

### Enhancement Flow
```
User Prompt → Context Analysis → Role Enhancement → Model Optimization → AI Model
     ↓              ↓                    ↓                   ↓              ↓
  "Add auth"   File context        Laravel guard     Model-specific   Enhanced
               detected            approach          formatting       response
```

## 📁 Project Structure

```
src/
├── core/
│   ├── extension.ts              # Main entry point
│   ├── extensionManager.ts       # Core lifecycle manager
│   └── ideAdapter.ts             # Cross-IDE compatibility
│
├── roles/
│   ├── roleManager.ts            # Role selection & switching
│   ├── roleContext.ts            # Context tracking
│   └── templates/
│       ├── backendRole.ts
│       ├── laravelRole.ts        # NEW
│       ├── corePhpRole.ts        # NEW
│       ├── reactRole.ts          # NEW
│       ├── frontendRole.ts
│       ├── qaRole.ts
│       ├── techleadRole.ts
│       └── projectManagerRole.ts # NEW
│
├── models/
│   ├── modelManager.ts           # Model selection & config
│   ├── modelProvider.ts          # Provider abstraction
│   └── providers/
│       ├── openai.ts
│       ├── anthropic.ts
│       ├── google.ts
│       ├── cursor.ts
│       └── local.ts
│
├── prompt/
│   ├── promptEnhancer.ts         # Main enhancement engine
│   ├── contextAnalyzer.ts        # File/project context
│   ├── intentDetector.ts         # User intent analysis
│   └── templateEngine.ts         # Dynamic template generation
│
├── ui/
│   ├── panels/
│   │   ├── mainPanel.ts          # Main control panel
│   │   ├── roleSelector.ts       # Enhanced role selection
│   │   └── modelSelector.ts      # Model configuration UI
│   ├── statusBar.ts              # Status bar integration
│   └── webviews/
│       ├── dashboard.html        # Main dashboard
│       ├── settings.html         # Settings panel
│       └── styles/
│
├── config/
│   ├── settings.ts               # Settings management
│   ├── defaults.ts               # Default configurations
│   └── schema.ts                 # Configuration schema
│
└── utils/
    ├── logger.ts                 # Logging system
    ├── storage.ts                # Persistent storage
    └── telemetry.ts              # Usage analytics
```

## 🔧 Configuration System

### User Settings
```json
{
  "smartdevide.defaultRole": "backend",
  "smartdevide.defaultModel": "gpt-4",
  "smartdevide.autoPromptEnhancement": true,
  "smartdevide.contextAwareness": true,
  "smartdevide.roleAutoSwitch": true,
  "smartdevide.showRoleInStatusBar": true,
  "smartdevide.models": {
    "openai": {
      "apiKey": "sk-...",
      "organization": "",
      "defaultModel": "gpt-4-turbo"
    },
    "anthropic": {
      "apiKey": "sk-ant-...",
      "defaultModel": "claude-3-opus"
    }
  }
}
```

### Project-Level Configuration (.smartdevide.json)
```json
{
  "preferredRole": "laravel",
  "preferredModel": "gpt-4",
  "projectType": "laravel",
  "conventions": {
    "codingStyle": "PSR-12",
    "testFramework": "pest",
    "namespaces": ["App\\", "Tests\\"]
  }
}
```

## 🎯 Key Features

### 1. Intelligent Role Switching
- Automatic role detection based on file type
- Manual override available
- Project-level role preferences
- Per-file role memory

### 2. Multi-Model Support
- Easy model switching
- Cost tracking per model
- Model comparison view
- Performance metrics

### 3. Prompt Enhancement
- Non-intrusive (doesn't change user input)
- Context-aware enrichment
- Role-specific instructions
- Best practices injection

### 4. Cross-IDE Compatibility
- Unified API for VS Code and Cursor
- IDE-specific optimizations
- Feature parity across IDEs
- Native integration points

## 🚀 Implementation Phases

### Phase 1: Core Architecture (Current)
- ✅ Enhanced role system
- ✅ Configuration management
- ✅ Cross-IDE adapter

### Phase 2: Model Integration
- 🔄 Model provider abstraction
- 🔄 API integrations
- 🔄 Model selection UI

### Phase 3: Prompt Enhancement
- 📋 Context analyzer
- 📋 Enhancement engine
- 📋 Intent detection

### Phase 4: Polish & Scale
- 📋 Telemetry
- 📋 Performance optimization
- 📋 Documentation

## 🔒 Security Considerations

- API keys encrypted in storage
- No key transmission to telemetry
- Local prompt enhancement
- User data privacy
- GDPR compliance

## 📊 Success Metrics

- Role switch frequency
- Prompt enhancement acceptance rate
- Model usage distribution
- User satisfaction (NPS)
- Response quality ratings
