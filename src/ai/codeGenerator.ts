import * as vscode from 'vscode';
import { completeChat, ChatMessage } from './openaiClient';
import { DEFAULT_ROLES } from '../config/defaults';
import { DEFAULT_OPENAI_API_KEY } from '../config/defaultOpenAiKey';
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
- Output only the requested code or content. No extra commentary before or after unless the user asks for explanation.
- Use the language and framework appropriate to the current file and project.
- Follow best practices and keep code production-ready.
- If the request is ambiguous, make a reasonable choice and keep the response focused.`;
}

/**
 * Get OpenAI API key: user's setting first, then extension default (if set).
 * Using your own key in Settings is optional; the default is used when none is set.
 */
function getOpenAIKey(): string | undefined {
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
 * Generate code using the current role and model, with optional prompt enhancement.
 */
export async function generateCode(
    userPrompt: string,
    role: DeveloperRole,
    modelId: string,
    enhancedPrompt?: string
): Promise<{ content: string; error?: string }> {
    const apiKey = getOpenAIKey();
    if (!apiKey || apiKey.trim() === '') {
        return { content: '', error: 'OpenAI API key not available. You can set your own in Settings (smartdevide.models.openai.apiKey) or use the extension as-is.' };
    }

    const systemPrompt = getSystemPromptForRole(role);
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
