# SmartDevIDE - Complete Setup Guide

## 🚀 Getting Started

This guide will help you set up and configure SmartDevIDE from scratch.

## 📋 Prerequisites

- VS Code 1.75.0 or higher (or Cursor IDE)
- Node.js 18+ (for development)
- TypeScript 5.0+ (for development)

## 🔨 Development Setup

### 1. Clone & Install

```bash
cd /path/to/extension/folder
npm install
```

### 2. Compile TypeScript

```bash
npm run compile
```

Or watch for changes:

```bash
npm run watch
```

### 3. Test in Development

1. Press `F5` in VS Code to open Extension Development Host
2. The extension will be loaded automatically
3. Make changes and press `Ctrl+R` to reload

### 4. Build VSIX Package

```bash
npm run package
```

This creates `smartdevide-2.0.1.vsix`

## 🔧 Production Installation

### Install from VSIX

```bash
code --install-extension smartdevide-2.0.1.vsix
```

### Verify Installation

1. Open VS Code or Cursor
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type **SmartDevIDE** – you should see all commands listed

### Commands summary

| Command | Description |
|--------|-------------|
| **SmartDevIDE: Select Role** | Choose developer role |
| **SmartDevIDE: Select Model** | Choose AI model |
| **SmartDevIDE: Generate Code** | Generate code with AI (`Cmd+Shift+G` / `Ctrl+Shift+G`) |
| **SmartDevIDE: Auto-Detect Role** | Detect role from file type |
| **SmartDevIDE: Open Demo** | Open demo panel |
| **SmartDevIDE: Generate Solution** | Open demo panel |
| **SmartDevIDE: Enhance Prompt** | Preview enhanced prompt |
| **SmartDevIDE: Open Settings** | Open extension settings |
| **SmartDevIDE: Show Status Info** | View current role and model |

## ⚙️ Configuration

### Step 1: Choose Your Role

**Option A: Via Command Palette**
```
Ctrl+Shift+P → SmartDevIDE: Select Role
```

**Option B: Via Status Bar**
Click the role indicator (e.g., "🔧 Backend Developer")

**Option C: Via Settings**
```json
{
  "smartdevide.defaultRole": "laravel"
}
```

### Step 2: Configure AI Models

#### OpenAI Setup

1. Get API Key from https://platform.openai.com/api-keys
2. Open Settings (`Ctrl+,`)
3. Search for "smartdevide.models.openai"
4. Configure:

```json
{
  "smartdevide.models.openai.enabled": true,
  "smartdevide.models.openai.apiKey": "sk-proj-xxxxx...",
  "smartdevide.models.openai.defaultModel": "gpt-4-turbo"
}
```

#### Anthropic Claude Setup

1. Get API Key from https://console.anthropic.com/
2. Configure:

```json
{
  "smartdevide.models.anthropic.enabled": true,
  "smartdevide.models.anthropic.apiKey": "sk-ant-xxxxx...",
  "smartdevide.models.anthropic.defaultModel": "claude-3-sonnet"
}
```

#### Google Gemini Setup

1. Get API Key from https://makersuite.google.com/app/apikey
2. Configure:

```json
{
  "smartdevide.models.google.enabled": true,
  "smartdevide.models.google.apiKey": "AIzaSyxxx...",
  "smartdevide.models.google.defaultModel": "gemini-pro"
}
```

#### Cursor Native (Auto-configured)

If using Cursor IDE:
```json
{
  "smartdevide.models.cursor.enabled": true
}
```

### Step 3: Select Your Model

```
Ctrl+Shift+P → SmartDevIDE: Select Model
```

Choose from available models across all configured providers.

### Step 4: Configure Prompt Enhancement

```json
{
  "smartdevide.autoPromptEnhancement": true,
  "smartdevide.contextAwareness": true,
  "smartdevide.promptEnhancement": {
    "enabled": true,
    "contextAwareness": true,
    "roleBasedEnhancement": true,
    "codePatternSuggestions": true,
    "bestPracticesInjection": true,
    "securityChecks": true
  }
}
```

## 🎯 Role-Specific Configuration

### For Laravel Projects

1. Set role to Laravel Developer
2. Extension auto-detects `composer.json` and `artisan`
3. Optimized for:
   - Eloquent ORM patterns
   - Laravel conventions
   - Blade templates
   - Artisan commands

```json
{
  "smartdevide.defaultRole": "laravel"
}
```

### For React Projects

1. Set role to React Developer
2. Extension auto-detects `package.json` with React
3. Optimized for:
   - Functional components
   - Hooks patterns
   - TypeScript types
   - Performance optimization

```json
{
  "smartdevide.defaultRole": "react"
}
```

### For Pure PHP Projects

1. Set role to Core PHP Developer
2. Optimized for:
   - PDO and prepared statements
   - Performance optimization
   - Security best practices
   - No framework dependencies

```json
{
  "smartdevide.defaultRole": "corephp"
}
```

## 🔄 Auto Role Switching

Enable automatic role detection based on file type:

```json
{
  "smartdevide.roleAutoSwitch": true
}
```

When enabled:
- Opening `.blade.php` → Laravel Developer
- Opening `.tsx/.jsx` → React Developer
- Opening `.php` → Core PHP Developer
- Opening `.test.ts` → QA Engineer
- Opening `.md` → Project Manager

## 📊 Project-Level Configuration

Create `.smartdevide.json` in your project root:

```json
{
  "preferredRole": "laravel",
  "preferredModel": "gpt-4-turbo",
  "projectType": "laravel",
  "framework": "laravel-10",
  "conventions": {
    "codingStyle": "PSR-12",
    "testFramework": "pest",
    "namespaces": ["App\\", "Tests\\"]
  },
  "customInstructions": "Use Laravel 10 features and follow team coding standards"
}
```

## 🎨 UI Customization

### Status Bar

Show/hide role and model in status bar:

```json
{
  "smartdevide.showRoleInStatusBar": true,
  "smartdevide.showModelInStatusBar": true
}
```

### Keyboard Shortcuts

Add custom shortcuts in `keybindings.json`:

```json
[
  {
    "key": "ctrl+alt+r",
    "command": "smartdevide.selectRole"
  },
  {
    "key": "ctrl+alt+m",
    "command": "smartdevide.selectModel"
  },
  {
    "key": "ctrl+alt+a",
    "command": "smartdevide.autoDetectRole"
  }
]
```

## 🔒 Security Best Practices

### API Key Storage

✅ **DO:**
- Store API keys in VS Code settings (encrypted)
- Use environment variables for team settings
- Rotate keys regularly

❌ **DON'T:**
- Commit API keys to version control
- Share API keys via chat/email
- Use production keys in development

### Secure Configuration

```json
{
  "smartdevide.telemetryEnabled": false, // Disable if privacy-sensitive
  "smartdevide.models.openai.apiKey": "${env:OPENAI_API_KEY}"
}
```

## 📈 Usage Monitoring

### Check Current Status

```
Ctrl+Shift+P → SmartDevIDE: Show Status Info
```

Displays:
- Current role and focus areas
- Selected model and provider
- Context window size
- Available commands

### Cost Tracking

View model pricing in model selection:
- GPT-4 Turbo: $10/1M input + $30/1M output
- Claude 3 Sonnet: $3/1M input + $15/1M output
- Gemini Pro: $0.50/1M input + $1.50/1M output

## 🧪 Testing Prompt Enhancement

Test the enhancement system:

```
Ctrl+Shift+P → SmartDevIDE: Enhance Prompt
```

Enter a simple prompt like: "Create a user registration form"

The system will:
1. Add current file context
2. Inject role-specific instructions
3. Add framework patterns
4. Include security guidelines
5. Add best practices

Compare original vs enhanced to see the difference!

## 🛠️ Troubleshooting

### Extension Not Loading

1. Check VS Code version >= 1.75.0
2. Reload window: `Ctrl+Shift+P` → "Reload Window"
3. Check extension logs: Output → SmartDevIDE

### API Key Errors

1. Verify key is valid and active
2. Check provider is enabled
3. Test key with curl:

```bash
# OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY"
```

### Models Not Appearing

1. Ensure provider is enabled: `smartdevide.models.<provider>.enabled: true`
2. Verify API key is set
3. Restart VS Code/Cursor
4. Check model availability in provider console

### Role Not Auto-Switching

1. Check `smartdevide.roleAutoSwitch: true`
2. Verify file pattern matches role
3. Try manual selection first
4. Check file is in workspace folder

## 🔄 Updates & Maintenance

### Check for Updates

The extension will notify you of updates automatically.

### Manual Update

```bash
code --install-extension smartdevide-2.0.1.vsix
```

### Reset to Defaults

Remove all settings:

```json
{
  // Delete all smartdevide.* settings
}
```

Then select role and model again.

## 📚 Advanced Usage

### Multi-Project Workflows

Different settings per project:

```bash
# Project A: Laravel
cd /path/to/laravel-project
# Uses .smartdevide.json with "preferredRole": "laravel"

# Project B: React
cd /path/to/react-project
# Uses .smartdevide.json with "preferredRole": "react"
```

### Team Configuration

Share settings via workspace settings:

```json
// .vscode/settings.json
{
  "smartdevide.defaultRole": "laravel",
  "smartdevide.promptEnhancement.enabled": true,
  // Don't commit API keys!
}
```

### CI/CD Integration

Use extension in automated workflows:

```yaml
# .github/workflows/ai-review.yml
- name: Install Extension
  run: code --install-extension smartdevide-2.0.1.vsix
  
- name: Generate Code Review
  run: |
    export OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
    # Use extension API
```

## 🎓 Learning Resources

### Role Guides

- [Laravel Developer Guide](docs/roles/laravel.md)
- [React Developer Guide](docs/roles/react.md)
- [Core PHP Guide](docs/roles/corephp.md)
- [QA Engineer Guide](docs/roles/qa.md)

### Example Workflows

- [Building a REST API](docs/examples/rest-api.md)
- [Creating React Components](docs/examples/react-components.md)
- [Writing Tests](docs/examples/testing.md)
- [Code Reviews](docs/examples/code-review.md)

## 💬 Get Help

- **Documentation**: [GitHub Wiki](https://github.com/poonam-em111/smartdevide/wiki)
- **Issues**: [GitHub Issues](https://github.com/poonam-em111/smartdevide/issues)
- **Discussions**: [GitHub Discussions](https://github.com/poonam-em111/smartdevide/discussions)
- **Email**: support@poonam-em111.com

## 🎉 You're Ready!

Your SmartDevIDE is now fully configured. Try:

1. Open a file
2. Check your role in status bar
3. Use `Ctrl+Shift+P` → SmartDevIDE commands
4. Start coding with AI assistance!

Happy coding! 🚀
