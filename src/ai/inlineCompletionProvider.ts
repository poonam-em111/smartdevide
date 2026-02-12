import * as vscode from 'vscode';
import { completeChat, ChatMessage } from './openaiClient';
import { getOpenAIKey } from './codeGenerator';
import { getProjectStyle, getWorkspaceRootForDocument } from './projectStyle';
import { getSuggestionModeInstructions } from './suggestionMode';
import { SECURITY_PROMPT_BLOCK } from './security';
import { DEFAULT_ROLES } from '../config/defaults';
import { DeveloperRole } from '../types';

const LINES_ABOVE = 18;
const MAX_SUGGESTION_TOKENS = 64;

export class SmartDevInlineProvider implements vscode.InlineCompletionItemProvider {
    constructor(
        private getRole: () => DeveloperRole,
        private getModelId: () => string,
        private outputChannel: vscode.OutputChannel
    ) {}

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null> {
        const config = vscode.workspace.getConfiguration('smartdevide');
        const debug = config.get<boolean>('inlineCompletion.debug', false);
        const log = (msg: string) => { if (debug) this.outputChannel.appendLine(`[InlineCompletion] ${msg}`); };

        if (!config.get<boolean>('inlineCompletion.enabled', true)) {
            log('skipped: disabled in settings');
            return null;
        }

        const apiKey = getOpenAIKey();
        const hasKey = !!(apiKey && apiKey.trim() !== '');
        if (!hasKey) {
            log('skipped: no API key (set default or smartdevide.models.openai.apiKey)');
            return null;
        }

        let modelId = this.getModelId();
        const isOpenAI = /^gpt-/.test(modelId);
        if (!isOpenAI) {
            modelId = 'gpt-4-turbo';
            log(`using fallback model ${modelId} (current model was not OpenAI)`);
        }
        // Use faster model for inline suggestions when configured (faster responses)
        if (config.get<boolean>('inlineCompletion.useFastModel', true)) {
            modelId = 'gpt-3.5-turbo';
        }

        const minLength = config.get<number>('inlineCompletion.minPrefixLength', 1);
        const linePrefix = document.getText(new vscode.Range(position.line, 0, position.line, position.character));
        if (linePrefix.trim().length < minLength && context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic) {
            log(`skipped: line prefix length ${linePrefix.trim().length} < ${minLength} (trigger: automatic)`);
            return null;
        }

        log(`requesting suggestion (${document.languageId}, trigger: ${context.triggerKind})`);

        const startLine = Math.max(0, position.line - LINES_ABOVE);
        const contextText = document.getText(new vscode.Range(startLine, 0, position.line, position.character));
        const languageId = document.languageId;

        const role = this.getRole();
        const roleMeta = DEFAULT_ROLES.find(r => r.name === role);
        const roleBias = roleMeta?.promptBias ?? 'Write clear, correct code.';
        const focusAreas = roleMeta?.focusAreas?.length ? roleMeta.focusAreas.join(', ') : 'best practices';

        const systemPrompt = `You are an expert developer in the role: ${role}.

Your focus: ${roleBias}
Focus areas for this role: ${focusAreas}

Suggest code that matches this role. E.g. Laravel Developer → Laravel/Eloquent patterns; React Developer → hooks, JSX; Core PHP → plain PHP, PDO; Backend → APIs, validation, security.

Rules:
- Output 1-3 lines only. Plain code—no markdown, no code fences, no explanation.
- Format cleanly: logical indentation, consistent spacing (prettier-style). Same style as the file.
- Add a brief comment on the line above when it clarifies (e.g. // validate input). Comments on next line only where helpful.
- Ensure every opened brace { bracket ( [ or tag you add has a matching close; do not leave unclosed. Check existing code for unclosed opens.
- NEVER repeat or duplicate existing code. Minimal, required-only suggestions.
- Do not add <?php or ?> unless the cursor is clearly starting a new PHP block.
- ${SECURITY_PROMPT_BLOCK}`;

        const modeInstructions = getSuggestionModeInstructions('inline');
        const workspaceRoot = getWorkspaceRootForDocument(document);
        const projectStyle = workspaceRoot ? await getProjectStyle(workspaceRoot) : '';
        let systemWithStyle = `${systemPrompt}\n\n${modeInstructions}`;
        if (projectStyle) systemWithStyle += `\n\n${projectStyle}`;

        const userContent = `Language: ${languageId}\n\nCode up to cursor:\n\`\`\`\n${contextText}\n\`\`\`\n\nSuggest only the next 1-3 lines (role: ${role}, no duplication):`;

        const messages: ChatMessage[] = [
            { role: 'system', content: systemWithStyle },
            { role: 'user', content: userContent }
        ];

        try {
            if (token.isCancellationRequested) {
                return null;
            }
            const result = await completeChat(
                apiKey!,
                modelId,
                messages,
                config.get<number>('inlineCompletion.maxTokens', MAX_SUGGESTION_TOKENS)
            );
            if (token.isCancellationRequested) {
                return null;
            }
            if (result.error || !result.content || result.content.trim() === '') {
                if (result.error) {
                    this.outputChannel.appendLine(`[InlineCompletion] ${result.error}`);
                }
                return null;
            }
            let text = result.content.trim();
            // Strip markdown code fences if present
            const fence = text.match(/^```[\w]*\n?/);
            if (fence) {
                text = text.slice(fence[0].length);
            }
            const endFence = text.lastIndexOf('```');
            if (endFence !== -1) {
                text = text.slice(0, endFence).trim();
            }
            const lines = text.split('\n');
            const maxLines = 3;
            text = lines.slice(0, maxLines).join('\n').trim();
            if (!text) {
                return null;
            }
            if (debug) this.outputChannel.appendLine(`[InlineCompletion] got ${text.length} chars`);
            return [new vscode.InlineCompletionItem(text)];
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.outputChannel.appendLine(`[InlineCompletion] ${msg}`);
            return null;
        }
    }
}
