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
exports.DemoPanel = void 0;
const vscode = __importStar(require("vscode"));
const roleManager_1 = require("./roleManager");
const backendRole_1 = require("./templates/backendRole");
const frontendRole_1 = require("./templates/frontendRole");
const qaRole_1 = require("./templates/qaRole");
const techleadRole_1 = require("./templates/techleadRole");
class DemoPanel {
    constructor(panel, extensionUri, getCurrentRole) {
        this.extensionUri = extensionUri;
        this.getCurrentRole = getCurrentRole;
        this.disposables = [];
        this.panel = panel;
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.webview.html = this.getHtmlContent();
        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'getCode') {
                this.sendCodeToWebview(message.commandType);
            }
        }, null, this.disposables);
    }
    static show(extensionUri, getCurrentRole) {
        const column = vscode.ViewColumn.One;
        if (DemoPanel.currentPanel) {
            DemoPanel.currentPanel.panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('behaviouraiDemo', 'BehaviourAI Demo', column, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
        });
        DemoPanel.currentPanel = new DemoPanel(panel, extensionUri, getCurrentRole);
    }
    sendCodeToWebview(commandType) {
        const role = this.getCurrentRole();
        const code = this.getCodeForRoleAndCommand(role, commandType);
        this.panel.webview.postMessage({
            command: 'updateCode',
            code: code,
            role: role
        });
    }
    getCodeForRoleAndCommand(role, commandType) {
        let templates;
        switch (role) {
            case roleManager_1.DeveloperRole.BACKEND:
                templates = backendRole_1.backendTemplates;
                break;
            case roleManager_1.DeveloperRole.FRONTEND:
                templates = frontendRole_1.frontendTemplates;
                break;
            case roleManager_1.DeveloperRole.QA:
                templates = qaRole_1.qaTemplates;
                break;
            case roleManager_1.DeveloperRole.TECHLEAD:
                templates = techleadRole_1.techLeadTemplates;
                break;
            default:
                templates = backendRole_1.backendTemplates;
        }
        switch (commandType) {
            case 'userCreation':
                return templates.userCreation;
            case 'restApi':
                return templates.restApi;
            case 'authentication':
                return templates.authentication;
            case 'optimization':
                return templates.optimization;
            default:
                return templates.userCreation;
        }
    }
    getHtmlContent() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BehaviourAI Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--vscode-widget-border);
        }

        h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .subtitle {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 20px;
        }

        .controls {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
        }

        label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.9;
        }

        select {
            width: 100%;
            padding: 10px 12px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }

        select:hover {
            border-color: var(--vscode-focusBorder);
        }

        select:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
            box-shadow: 0 0 0 1px var(--vscode-focusBorder);
        }

        .role-badge {
            display: inline-block;
            padding: 6px 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
        }

        .code-container {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .code-header {
            padding: 12px 16px;
            background: var(--vscode-editorGroupHeader-tabsBackground);
            border-bottom: 1px solid var(--vscode-widget-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .code-header span {
            font-size: 12px;
            font-weight: 600;
            opacity: 0.8;
        }

        pre {
            margin: 0;
            padding: 20px;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
        }

        code {
            color: var(--vscode-editor-foreground);
        }

        .loading {
            text-align: center;
            padding: 40px;
            opacity: 0.6;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .code-container {
            animation: fadeIn 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 BehaviourAI Demo</h1>
            <p class="subtitle">Same command. Different outputs. Based on role, not prompts.</p>
        </div>

        <div class="controls">
            <div>
                <label for="command-select">Select Command</label>
                <select id="command-select">
                    <option value="userCreation">Generate user creation solution</option>
                    <option value="restApi">Build REST API endpoint</option>
                    <option value="authentication">Implement authentication</option>
                    <option value="optimization">Optimize component</option>
                </select>
            </div>
        </div>

        <div id="role-display" class="role-badge">🎯 Loading role...</div>

        <div class="code-container">
            <div class="code-header">
                <span>AI Generated Code</span>
                <span id="command-label">User Creation Solution</span>
            </div>
            <pre><code id="code-output" class="loading">Select a command to see role-specific output...</code></pre>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const commandSelect = document.getElementById('command-select');
        const codeOutput = document.getElementById('code-output');
        const roleDisplay = document.getElementById('role-display');
        const commandLabel = document.getElementById('command-label');

        const commandLabels = {
            userCreation: 'User Creation Solution',
            restApi: 'REST API Endpoint',
            authentication: 'Authentication Implementation',
            optimization: 'Component Optimization'
        };

        commandSelect.addEventListener('change', () => {
            const selectedCommand = commandSelect.value;
            commandLabel.textContent = commandLabels[selectedCommand];
            
            vscode.postMessage({
                command: 'getCode',
                commandType: selectedCommand
            });
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.command === 'updateCode') {
                codeOutput.textContent = message.code;
                codeOutput.className = '';
                roleDisplay.textContent = '🎯 ' + message.role;
            }
        });

        // Request initial code on load
        setTimeout(() => {
            vscode.postMessage({
                command: 'getCode',
                commandType: 'userCreation'
            });
        }, 100);
    </script>
</body>
</html>`;
    }
    dispose() {
        DemoPanel.currentPanel = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
exports.DemoPanel = DemoPanel;
//# sourceMappingURL=demoPanel.js.map