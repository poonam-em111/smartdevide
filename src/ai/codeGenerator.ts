import * as vscode from 'vscode';
import { completeChat, ChatMessage } from './openaiClient';
import { getSuggestionModeInstructions } from './suggestionMode';
import { SECURITY_PROMPT_BLOCK } from './security';
import { DEFAULT_ROLES, DEFAULT_OPENAI_API_KEY } from '../config/defaults';
import { DeveloperRole } from '../types';

/**
 * Build system prompt for the current role.
 */
function getSystemPromptForRole(role: DeveloperRole): string {
    const meta = DEFAULT_ROLES.find(r => r.name === role);
    const bias = meta?.promptBias || 'Write clear, correct code.';
    return `You are an expert developer acting as: ${role}.

Your approach: ${bias}

Rules:
- Output only the requested code or content. No extra commentary unless the user asks for explanation.
- Format code like a code formatter (prettier-style): logical indentation, consistent spacing, readable structure.
- Use next-line comments for non-obvious logic (e.g. // validate and sanitize). Place comments on the line above the code they describe.
- Ensure every opened brace { bracket ( [ or tag < has a matching close; no unclosed opens. Check PHP <?php ... ?> and HTML/JSX tags.
- Do NOT duplicate code: never repeat the same line or block. Generate only what is needed—minimal and useful (like Copilot).
- Use the language and framework appropriate to the current file and project. Production-ready, best practices.
- ${SECURITY_PROMPT_BLOCK}`;
}

/**
 * Get suggestion-mode and anti-hallucination instructions for generation.
 */
function getGenerationModeInstructions(): string {
    return getSuggestionModeInstructions('generate');
}

/**
 * Get OpenAI API key: user's setting first, then extension default (if set).
 * Using your own key in Settings is optional; the default is used when none is set.
 */
export function getOpenAIKey(): string | undefined {
    const userKey = vscode.workspace.getConfiguration('smartdevide').get<string>('models.openai.apiKey');
    if (userKey && userKey.trim() !== '') {
        return userKey.trim();
    }
    const defaultKey = (typeof DEFAULT_OPENAI_API_KEY === 'string' && DEFAULT_OPENAI_API_KEY.trim() !== '')
        ? DEFAULT_OPENAI_API_KEY.trim()
        : undefined;
    return defaultKey;
}

/**
 * Generate code using the current role and model, with optional prompt enhancement and project style.
 */
export async function generateCode(
    userPrompt: string,
    role: DeveloperRole,
    modelId: string,
    enhancedPrompt?: string,
    projectStyle?: string
): Promise<{ content: string; error?: string }> {
    const apiKey = getOpenAIKey();
    if (!apiKey || apiKey.trim() === '') {
        return { content: '', error: 'OpenAI API key not available. You can set your own in Settings (smartdevide.models.openai.apiKey) or use the extension as-is.' };
    }

    let systemPrompt = getSystemPromptForRole(role);
    systemPrompt += `\n\n${getGenerationModeInstructions()}`;
    if (projectStyle && projectStyle.trim() !== '') {
        systemPrompt = `${systemPrompt}\n\n${projectStyle.trim()}`;
    }
    const promptToSend = (enhancedPrompt && enhancedPrompt.trim() !== '') ? enhancedPrompt : userPrompt;

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptToSend }
    ];

    const result = await completeChat(apiKey, modelId, messages);
    if (result.error) {
        return { content: '', error: result.error };
    }
    return { content: result.content };
}
