# SmartDevIDE - Enhanced AI Coding Assistant

> Enterprise-grade AI coding assistant with role-based behavior, multi-model support, and intelligent prompt enhancement for VS Code and Cursor.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/poonam-em111/smartdevide)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/poonam-em111/smartdevide/blob/HEAD/LICENSE)

## 🌟 Key Features

### 🎭 Role-Based AI Behavior
Switch between 8 specialized developer roles, each with unique focus areas and coding patterns:

- **🔧 Backend Developer** - APIs, databases, scalability
- **🎸 Laravel Developer** - Laravel framework, Eloquent, Blade
- **🐘 Core PHP Developer** - Pure PHP, performance, security
- **⚛️ React Developer** - Modern React, hooks, TypeScript
- **🎨 Frontend Developer** - UI/UX, styling, accessibility
- **🧪 QA Engineer** - Testing, edge cases, security
- **🏗️ Tech Lead** - Architecture, design decisions
- **📋 Project Manager** - Planning, documentation, coordination

### 🤖 Multi-Model Support
Choose from multiple AI providers and models:

- **OpenAI** - GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Anthropic** - Claude 3 Opus, Sonnet, Haiku
- **Google** - Gemini Pro
- **Cursor** - Native Cursor models
- **Local** - Ollama integration (coming soon)

### 🎯 Intelligent Prompt Enhancement
Automatically enhance prompts without changing your input:

- **Context Awareness** - Adds file, project, and workspace context
- **Role-Based Instructions** - Injects role-specific best practices
- **Code Pattern Suggestions** - Framework and language-specific patterns
- **Security Guidelines** - Security best practices automatically included
- **Best Practices** - Industry-standard coding guidelines

### 🔄 Cross-IDE Support
Works seamlessly in both:
- **Visual Studio Code** - Full feature support
- **Cursor IDE** - Enhanced integration with native features

## 📦 Installation

### From VSIX (Recommended)
1. Download the latest `.vsix` file
2. Open VS Code or Cursor
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type: "Extensions: Install from VSIX"
5. Select the downloaded file

### From Marketplace (Coming Soon)
1. Open VS Code or Cursor
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "SmartDevIDE"
4. Click Install

## 🚀 Quick Start

### 1. Select Your Role
```
Ctrl+Shift+P → SmartDevIDE: Select Role
```
Or click the role indicator in the status bar (🔧 Backend Developer)

### 2. Configure AI Model
```
Ctrl+Shift+P → SmartDevIDE: Select Model
```

#### OpenAI Setup
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open Settings: `Ctrl+,`
3. Search for "smartdevide"
4. Enable OpenAI and paste your API key

#### Anthropic (Claude) Setup
1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Enable in settings and add API key

#### Google Gemini Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Enable in settings and add API key

### 3. Start Coding!
The extension enhances your AI interactions based on:
- Your selected role
- Current file context
- Project structure
- Selected code

## 📖 Usage Examples

### Auto-Detect Role
```
Ctrl+Shift+P → SmartDevIDE: Auto-Detect Role
```
Automatically suggests role based on current file type.

### Enhance Prompt
```
Ctrl+Shift+P → SmartDevIDE: Enhance Prompt
```
Enter your prompt and see how it's enhanced with context and role-specific instructions.

### View Status
```
Ctrl+Shift+P → SmartDevIDE: Show Status Info
```
See current role, model, and available features.

## ⚙️ Configuration

### Basic Settings

```json
{
  "smartdevide.defaultRole": "backend",
  "smartdevide.defaultModel": "gpt-4-turbo",
  "smartdevide.autoPromptEnhancement": true,
  "smartdevide.contextAwareness": true,
  "smartdevide.roleAutoSwitch": false
}
```

### Model Configuration

```json
{
  "smartdevide.models.openai.enabled": true,
  "smartdevide.models.openai.apiKey": "sk-...",
  "smartdevide.models.openai.defaultModel": "gpt-4-turbo",
  
  "smartdevide.models.anthropic.enabled": true,
  "smartdevide.models.anthropic.apiKey": "sk-ant-...",
  "smartdevide.models.anthropic.defaultModel": "claude-3-sonnet"
}
```

### Prompt Enhancement Settings

```json
{
  "smartdevide.promptEnhancement.enabled": true,
  "smartdevide.promptEnhancement.contextAwareness": true,
  "smartdevide.promptEnhancement.roleBasedEnhancement": true,
  "smartdevide.promptEnhancement.codePatternSuggestions": true,
  "smartdevide.promptEnhancement.bestPracticesInjection": true,
  "smartdevide.promptEnhancement.securityChecks": true
}
```

## 🎯 Role Descriptions

### Backend Developer
**Focus**: Server-side logic, APIs, databases
**Output Style**: Production-ready code with error handling, transactions, caching
**Best For**: RESTful APIs, database operations, authentication systems

### Laravel Developer
**Focus**: Laravel framework, conventions, packages
**Output Style**: Eloquent models, migrations, service containers
**Best For**: Laravel applications, Artisan commands, Blade templates

### Core PHP Developer
**Focus**: Pure PHP without frameworks
**Output Style**: PDO, prepared statements, performance optimization
**Best For**: Legacy systems, high-performance applications

### React Developer
**Focus**: Modern React patterns, hooks, TypeScript
**Output Style**: Functional components, custom hooks, optimized rendering
**Best For**: React applications, component libraries, SPAs

### Frontend Developer
**Focus**: UI/UX, responsive design, accessibility
**Output Style**: Semantic HTML, modern CSS, accessible interfaces
**Best For**: Web interfaces, landing pages, design systems

### QA Engineer
**Focus**: Testing, validation, security
**Output Style**: Comprehensive test suites, edge cases, security tests
**Best For**: Unit tests, integration tests, test automation

### Tech Lead
**Focus**: Architecture, system design, decisions
**Output Style**: Architecture docs, trade-off analysis, scaling plans
**Best For**: System design, technical documentation, architecture reviews

### Project Manager
**Focus**: Planning, documentation, coordination
**Output Style**: Project plans, timelines, requirement docs
**Best For**: Feature planning, documentation, project tracking

## 🔧 Advanced Features

### Auto Role Switching
Enable automatic role switching based on file type:
```json
{
  "smartdevide.roleAutoSwitch": true
}
```

### Context Awareness
The extension automatically includes:
- Current file name and language
- Project type (Laravel, React, etc.)
- Selected code
- Open files
- Workspace structure

### Model Cost Tracking
View estimated costs for different models:
- OpenAI GPT-4 Turbo: $10/1M input, $30/1M output
- Anthropic Claude 3 Sonnet: $3/1M input, $15/1M output
- Google Gemini Pro: $0.50/1M input, $1.50/1M output

## 📊 Keyboard Shortcuts

| Command | Shortcut | Description |
|---------|----------|-------------|
| Select Role | - | Choose developer role |
| Select Model | - | Choose AI model |
| Auto-Detect Role | - | Detect role from file |
| Enhance Prompt | - | Test prompt enhancement |
| Open Demo | - | View feature demo |
| Show Info | - | View current status |

*Customize shortcuts in: File > Preferences > Keyboard Shortcuts*

## 🔒 Security & Privacy

- **API Keys**: Stored securely in VS Code's secret storage
- **No Data Sent**: Your code stays local unless you explicitly request AI assistance
- **Telemetry**: Anonymous usage data (can be disabled)
- **Open Source**: Full transparency in code

## 🐛 Troubleshooting

### Models Not Showing
1. Check that provider is enabled in settings
2. Verify API key is correctly entered
3. Restart VS Code/Cursor

### Role Not Changing
1. Check status bar for current role
2. Try manual role selection
3. Disable auto-switching if enabled

### Prompt Enhancement Not Working
1. Check `smartdevide.autoPromptEnhancement` is enabled
2. Verify role is selected
3. Check extension output logs

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 Changelog

### Version 2.0.0
- ✨ Added 4 new roles (Laravel, Core PHP, React, Project Manager)
- 🤖 Multi-model support (OpenAI, Anthropic, Google, Cursor)
- 🎯 Intelligent prompt enhancement
- 🔄 Cross-IDE compatibility (VS Code + Cursor)
- ⚙️ Comprehensive configuration system
- 📊 Model cost tracking
- 🎨 Enhanced UI with status bar indicators

### Version 1.0.0
- Initial release with 4 roles
- Demo panel
- Basic role switching

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🔗 Links

- [GitHub Repository](https://github.com/poonam-em111/smartdevide)
- [Issue Tracker](https://github.com/poonam-em111/smartdevide/issues)
- [Documentation](https://github.com/poonam-em111/smartdevide/wiki)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/poonam-em111/smartdevide/issues)
- **Discussions**: [GitHub Discussions](https://github.com/poonam-em111/smartdevide/discussions)
- **Email**: support@poonam-em111.com

---

**Built with ❤️ by AI Mavricks**
