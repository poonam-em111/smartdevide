import * as vscode from 'vscode';
import { completeChat, ChatMessage } from './openaiClient';
import { getOpenAIKey } from './codeGenerator';
import { getProjectStyle } from './projectStyle';
import { getSuggestionModeInstructions } from './suggestionMode';
import { SECURITY_PROMPT_BLOCK } from './security';
import { DEFAULT_ROLES } from '../config/defaults';
import { DeveloperRole } from '../types';

const FIX_ACTION_TITLE = 'SmartDevIDE: Fix with AI';
const EXPLAIN_ACTION_TITLE = 'SmartDevIDE: Explain';

const LINES_CONTEXT = 15;

export interface FixExplainArgs {
    uri: string;
    startLine: number;
    startChar: number;
    endLine: number;
    endChar: number;
    message: string;
    code: string;
    languageId: string;
    contextBefore: string;
    contextAfter: string;
}

export class SmartDevCodeActionsProvider implements vscode.CodeActionProvider {
    static readonly fixKind = vscode.CodeActionKind.QuickFix.append('smartdevide.fix');
    static readonly explainKind = vscode.CodeActionKind.QuickFix.append('smartdevide.explain');

    constructor(
        private getRole: () => DeveloperRole,
        private getModelId: () => string,
        private outputChannel: vscode.OutputChannel
    ) {}

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        _token: vscode.CancellationToken
    ): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];
        const apiKey = getOpenAIKey();
        const hasKey = !!(apiKey && apiKey.trim() !== '');
        let modelId = this.getModelId();
        if (!/^gpt-/.test(modelId)) {
            modelId = 'gpt-4-turbo';
        }
        if (!hasKey) {
            return actions;
        }

        for (const diagnostic of context.diagnostics) {
            const diagRange = diagnostic.range;
            const code = document.getText(diagRange);
            const startLine = Math.max(0, diagRange.start.line - LINES_CONTEXT);
            const endLine = Math.min(document.lineCount - 1, diagRange.end.line + LINES_CONTEXT);
            const contextBefore = document.getText(new vscode.Range(startLine, 0, diagRange.start.line, 0));
            const contextAfter = document.getText(new vscode.Range(diagRange.end.line + 1, 0, endLine + 1, 0));
            const args: FixExplainArgs = {
                uri: document.uri.toString(),
                startLine: diagRange.start.line,
                startChar: diagRange.start.character,
                endLine: diagRange.end.line,
                endChar: diagRange.end.character,
                message: diagnostic.message,
                code,
                languageId: document.languageId,
                contextBefore,
                contextAfter
            };

            const fixAction = new vscode.CodeAction(FIX_ACTION_TITLE, SmartDevCodeActionsProvider.fixKind);
            fixAction.diagnostics = [diagnostic];
            fixAction.command = {
                command: 'smartdevide.fixWithAI',
                title: FIX_ACTION_TITLE,
                arguments: [args]
            };
            actions.push(fixAction);

            const explainAction = new vscode.CodeAction('SmartDevIDE: Explain', SmartDevCodeActionsProvider.explainKind);
            explainAction.diagnostics = [diagnostic];
            explainAction.command = {
                command: 'smartdevide.explainWithAI',
                title: EXPLAIN_ACTION_TITLE,
                arguments: [args]
            };
            actions.push(explainAction);
        }
        return actions;
    }
}

export async function runFixWithAI(
    args: FixExplainArgs,
    getRole: () => DeveloperRole,
    getModelId: () => string,
    outputChannel: vscode.OutputChannel
): Promise<void> {
    const apiKey = getOpenAIKey();
    if (!apiKey?.trim()) {
        vscode.window.showErrorMessage('SmartDevIDE: No API key. Set smartdevide.models.openai.apiKey or use the extension default.');
        return;
    }
    let modelId = getModelId();
    if (!/^gpt-/.test(modelId)) modelId = 'gpt-4-turbo';
    const role = getRole();
    const roleMeta = DEFAULT_ROLES.find(r => r.name === role);
    const roleBias = roleMeta?.promptBias ?? 'Clear, correct code.';
    const workspaceRoot = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(args.uri))?.uri;
    const projectStyle = workspaceRoot ? await getProjectStyle(workspaceRoot) : '';
    const modeInstructions = getSuggestionModeInstructions('fix');

    const systemPromptBase = `You are an expert developer in the role: ${role}. Your approach: ${roleBias}

Apply the MINIMAL fix for the reported issue. Fixes should align with this role's practices. ${modeInstructions}

Rules:
- Read the FULL context (code before and after the snippet) to understand structure. Check for unclosed { ( [ or tags; add missing closes, do not remove code.
- Prefer adding missing characters (closing braces }, semicolons ;, parentheses) over removing or rewriting.
- NEVER remove <?php or ?> or valid code. NEVER replace large sections. Fix only what the error says. No duplicate blocks.
- Output formatted code: logical indentation, consistent spacing. Add a brief next-line comment only when it clarifies the fix.
- If the issue is "missing closing brace" or "expected }", output the snippet WITH the closing brace added (or only the missing } if that is the minimal fix).
- Output ONLY the replacement for the [SNIPPET] section. No markdown, no code fences, no explanation. Same or fewer lines.
- ${SECURITY_PROMPT_BLOCK}`;
    const systemPrompt = projectStyle ? `${systemPromptBase}\n\n${projectStyle}` : systemPromptBase;
    const userContent = `Issue: ${args.message}\n\nLanguage: ${args.languageId}\n\nCode BEFORE the snippet:\n\`\`\`\n${args.contextBefore}\n\`\`\`\n\n[SNIPPET TO FIX]:\n\`\`\`\n${args.code}\n\`\`\`\n\nCode AFTER the snippet:\n\`\`\`\n${args.contextAfter}\n\`\`\`\n\nOutput only the fixed snippet (minimal change, preserve structure):`;

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
    ];

    try {
        const result = await completeChat(apiKey, modelId, messages, 1024);
        if (result.error || !result.content?.trim()) {
            vscode.window.showErrorMessage(`SmartDevIDE: ${result.error || 'No fix returned'}`);
            if (result.error) outputChannel.appendLine(`[Fix] ${result.error}`);
            return;
        }
        let text = result.content.trim();
        const fence = text.match(/^```[\w]*\n?/);
        if (fence) text = text.slice(fence[0].length);
        const endFence = text.lastIndexOf('```');
        if (endFence !== -1) text = text.slice(0, endFence).trim();
        // Avoid replacing a small range with a huge block: cap at original snippet lines + 3
        const snippetLines = args.code.split('\n').length;
        const maxFixLines = Math.min(snippetLines + 3, 12);
        const fixLines = text.split('\n');
        if (fixLines.length > maxFixLines) {
            text = fixLines.slice(0, maxFixLines).join('\n').trim();
        }

        const uri = vscode.Uri.parse(args.uri);
        const range = new vscode.Range(args.startLine, args.startChar, args.endLine, args.endChar);

        // Apply via the editor that has this document so the fix appears in the open file (works for untitled/saved)
        const editor = vscode.window.visibleTextEditors.find(e => e.document.uri.toString() === args.uri)
            || vscode.window.activeTextEditor;
        if (editor && editor.document.uri.toString() === args.uri) {
            const doc = editor.document;
            if (range.start.line >= doc.lineCount || range.end.line >= doc.lineCount) {
                vscode.window.showErrorMessage('SmartDevIDE: Fix could not be applied (document changed). Run Fix with AI again.');
                return;
            }
            const applied = await editor.edit(editBuilder => {
                editBuilder.replace(range, text);
            });
            if (applied) {
                vscode.window.showInformationMessage('SmartDevIDE: Fix applied.');
            } else {
                vscode.window.showErrorMessage('SmartDevIDE: Could not apply fix. Run Fix with AI again or save the file first.');
                outputChannel.appendLine('[Fix] editor.edit returned false');
            }
            return;
        }

        // Fallback: WorkspaceEdit when the document is not in any visible editor
        const doc = await vscode.workspace.openTextDocument(uri);
        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.replace(doc.uri, range, text);
        const applied = await vscode.workspace.applyEdit(workspaceEdit);
        if (applied) {
            vscode.window.showInformationMessage('SmartDevIDE: Fix applied.');
        } else {
            vscode.window.showErrorMessage('SmartDevIDE: Could not apply fix. Ensure the file is open and try again.');
            outputChannel.appendLine('[Fix] workspace.applyEdit returned false');
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        outputChannel.appendLine(`[Fix] ${msg}`);
        vscode.window.showErrorMessage(`SmartDevIDE: ${msg}`);
    }
}

export async function runExplainWithAI(
    args: FixExplainArgs,
    getRole: () => DeveloperRole,
    getModelId: () => string,
    outputChannel: vscode.OutputChannel
): Promise<void> {
    const apiKey = getOpenAIKey();
    if (!apiKey?.trim()) {
        vscode.window.showErrorMessage('SmartDevIDE: No API key. Set smartdevide.models.openai.apiKey or use the extension default.');
        return;
    }
    let modelId = getModelId();
    if (!/^gpt-/.test(modelId)) modelId = 'gpt-4-turbo';
    const role = getRole();
    const roleMeta = DEFAULT_ROLES.find(r => r.name === role);
    const roleBias = roleMeta?.promptBias ?? 'Clear, correct code.';
    const workspaceRoot = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(args.uri))?.uri;
    const projectStyle = workspaceRoot ? await getProjectStyle(workspaceRoot) : '';

    const systemPromptBase = `You are an expert developer in the role: ${role}. Your approach: ${roleBias}

Explain the issue and how to fix it in clear, concise language. Use markdown. Tailor the explanation to this role's focus.`;
    const systemPrompt = projectStyle ? `${systemPromptBase}\n\n${projectStyle}` : systemPromptBase;
    const userContent = `Issue: ${args.message}\n\nLanguage: ${args.languageId}\n\nCode:\n\`\`\`\n${args.code}\n\`\`\`\n\nExplain the problem and the fix:`;

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
    ];

    try {
        const result = await completeChat(apiKey, modelId, messages, 1024);
        if (result.error || !result.content?.trim()) {
            vscode.window.showErrorMessage(`SmartDevIDE: ${result.error || 'No explanation returned'}`);
            if (result.error) outputChannel.appendLine(`[Explain] ${result.error}`);
            return;
        }
        const doc = await vscode.workspace.openTextDocument({
            content: `# SmartDevIDE: Explanation\n\n${result.content.trim()}`,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.Beside });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        outputChannel.appendLine(`[Explain] ${msg}`);
        vscode.window.showErrorMessage(`SmartDevIDE: ${msg}`);
    }
}
