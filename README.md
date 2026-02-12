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

### ✨ AI Auto-Suggestions & Quick Fix
- **Inline completions** – Ghost-text suggestions as you type, using your API key (or the extension default).
- **Fix with AI** – On any error/warning, use the lightbulb (Quick Fix) → **SmartDevIDE: Fix with AI** to apply an AI-suggested fix.
- **Explain** – Quick Fix → **SmartDevIDE: Explain** to get an AI explanation of the issue and how to fix it.

### 🔒 Security-First by Design
- **Secure defaults in generated code** – All suggestions (inline, Generate Code, Fix with AI) are instructed to: use parameterized queries / prepared statements (no SQL concatenation), secure auth (e.g. password_hash, bcrypt, CSRF), and never output hardcoded secrets or API keys.
- **Security Review mode** – Run **SmartDevIDE: Security Review** (Command Palette or right-click → SmartDevIDE) on the current file or selection. The AI reviews the code for:
  - **SQL injection** – User input in raw SQL; recommends prepared statements.
  - **Insecure auth** – Weak or plain-text password handling; recommends password_hash/bcrypt, CSRF.
  - **Hardcoded secrets** – API keys, passwords in source; recommends env vars.
  - **Other** – XSS, path traversal, missing validation where relevant.
- A short markdown report opens beside the editor with severity and one-line recommendations. A quick heuristic scan (e.g. obvious SQL + $_GET) is also run and passed as hints to the reviewer.

### 🎯 More Accurate & Relevant Suggestions
- **Less hallucination** – Prompts instruct the model to use only real, documented APIs (no made-up methods or classes). Prefer short, precise suggestions over long risky blocks.
- **Safe / Minimal / Verbose modes** – **SmartDevIDE › Suggestion Mode**:
  - **safe** (default) – Only well-documented, standard APIs; minimal code; no speculative methods.
  - **minimal** – Shortest possible suggestion (1 line when possible).
  - **verbose** – May suggest longer blocks when clearly correct; still no invented APIs.
- **Reasoning hint** – **SmartDevIDE › Suggestion Reasoning Hint**: when enabled, suggestions can include a short comment (e.g. `// uses Array.map`) so you see the approach or API used, as a confidence/relevance hint.

### 📐 Auto-Learn Project Style (Never Fight the Style Guide)
SmartDevIDE reads your project’s tooling and structure so generated code respects coding standards and never fights the project's style guide:

- **Prettier** – Reads `.prettierrc`, `.prettierrc.json`, `.prettierrc.yaml`, `prettier.config.*`, or `package.json` → tabWidth, useTabs, quotes, semicolons, printWidth, trailingComma, arrowParens
- **ESLint** – Reads `.eslintrc`, `.eslintrc.*`, `eslint.config.js` → indent, quotes, semi rules (and extends); generated code must comply when present
- **PHP-CS-Fixer** – Reads `.php-cs-fixer.php`, `.php-cs-fixer.dist.php`, `.php_cs` → PSR-12, @Symfony, @PhpCsFixer rulesets
- **Folder structure** – Top-level directories (e.g. `src/`, `app/`, `components/`) so suggestions fit your layout
- **Naming conventions (auto-learn)** – Infers PascalCase, snake_case, kebab-case, camelCase from file and folder names in `app/`, `src/`, `lib/`, `components/`, `pages/` so naming matches the project
- **Explicit rule** – All prompts instruct: never fight the project's style guide; generated code must comply with ESLint, Prettier, or PHP-CS-Fixer when present

### 🧠 Smarter Context Understanding (Whole-Project)
Suggestions use **whole-project context**, not just the current file:

- **Framework detection** – Detects Laravel (composer.json), React / Next.js / Vue / Nuxt / Angular (package.json) and injects “Framework: X. Use its conventions.”
- **Project structure** – Key paths are inferred (e.g. Laravel: `app/Http`, `app/Models`, `resources/views`, `routes`; React: `src/components`, `src/pages`, `src/hooks`) so code fits your architecture.
- **Respect existing patterns** – The AI is instructed to respect existing patterns, naming, and architecture and to match conventions used elsewhere in the project.
- **Avoid breaking flows** – Explicit instruction: do not suggest code that breaks existing flows, duplicates logic, or contradicts patterns already in the project.

Controlled by **SmartDevIDE › Project Style: Enabled** (on by default). Inline completion, Fix with AI, Explain, and Generate Code all use both style and whole-project context.

### 🎯 Intelligent Prompt Enhancement
Automatically enhance prompts without changing your input:

- **Context Awareness** - Adds file, project, and workspace context
- **Role-Based Instructions** - Injects role-specific best practices
- **Code Pattern Suggestions** - Framework and language-specific patterns
- **Security Guidelines** - Security best practices automatically included
- **Best Practices** - Industry-standard coding guidelines

### 🧪 Built-in Testing & Validation
SmartDevIDE helps you test and validate code before or after generation:

- **Generate unit tests with code** – After **Generate Code**, or from the Command Palette / editor context menu: **SmartDevIDE: Generate Unit Tests**. Generates focused unit tests for the current file or selection using the project’s test framework (Jest, Vitest, PHPUnit, pytest, etc.) when detectable.
- **Generate edge cases** – **SmartDevIDE: Generate Edge Cases** produces tests for boundaries (empty, null, zero, max length), invalid input, and error paths. Available after Generate Code or from the menu.
- **Run static checks before suggesting final code** – **SmartDevIDE: Run Static Checks** runs ESLint (JS/TS/Vue), TypeScript `tsc --noEmit`, or PHP `php -l` on the current file when those tools exist in the workspace. Use it after inserting generated code to catch lint/type/syntax issues. Results appear in the SmartDevIDE output channel and in a short notification.
- **Flag untested or risky logic** – **SmartDevIDE: Flag Untested / Risky Logic** uses the AI to analyze the current file or selection and report: hard-to-test logic, risky patterns (null/undefined, missing error handling), missing edge-case handling, and fragile code. Output is a markdown report in a side panel.

After **Generate Code** completes, a quick pick offers: *Generate unit tests*, *Generate edge cases*, *Run static checks*, or *Flag untested/risky logic* so you can validate in one click.

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

## 📋 Commands Reference

All commands are available via the **Command Palette**:

- **Windows/Linux:** `Ctrl+Shift+P`
- **Mac:** `Cmd+Shift+P`

Then type **SmartDevIDE** to filter the list.

| Command | Description | Shortcut (Mac) | Shortcut (Win/Linux) |
|--------|-------------|----------------|----------------------|
| **SmartDevIDE: Select Role** | Choose your developer role (Backend, Laravel, React, QA, etc.). Shown in the status bar. | — | — |
| **SmartDevIDE: Select Model** | Choose the AI model (e.g. GPT-4 Turbo, Claude). Shown in the status bar. | — | — |
| **SmartDevIDE: Generate Code** | Generate code with AI using the current role and model. Inserts or replaces in the editor. | `Cmd+Shift+G` | `Ctrl+Shift+G` |
| **SmartDevIDE: Auto-Detect Role** | Suggest role based on the current file type. | — | — |
| **SmartDevIDE: Open Demo** | Open the demo panel with role-based code examples. | — | — |
| **SmartDevIDE: Generate Solution** | Quick access to the demo panel. | — | — |
| **SmartDevIDE: Enhance Prompt** | Enter a prompt and see the enhanced version (context + role). | — | — |
| **SmartDevIDE: Open Settings** | Open SmartDevIDE settings. | — | — |
| **SmartDevIDE: Show Status Info** | Show current role, model, and commands in a document. | — | — |

### How to run a command

1. Press **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows/Linux).
2. Type **SmartDevIDE** (or the command name, e.g. **Generate Code**).
3. Select the command and press Enter.

### Generate Code (AI)

- **From Command Palette:** `Cmd+Shift+P` / `Ctrl+Shift+P` → **SmartDevIDE: Generate Code**
- **Keyboard shortcut:** `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Windows/Linux) when the editor is focused.
- **Right-click:** In the editor, right-click → **SmartDevIDE** → **SmartDevIDE: Generate Code**

With **Generate Code**, you can type a prompt (e.g. “Create a user registration form”) or select code and use it as the prompt. The extension uses your current role and model and inserts the result into the editor.

### Status bar

- Click the **role** (e.g. 🔧 Backend Developer) to run **Select Role**.
- Click the **model** (e.g. 🤖 GPT-4 Turbo) to run **Select Model**.

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
