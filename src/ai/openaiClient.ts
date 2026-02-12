/**
 * OpenAI API client for SmartDevIDE code generation.
 * Uses workspace API key from smartdevide.models.openai.apiKey.
 */

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OpenAIResponse {
    content: string;
    model: string;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    error?: string;
}

export async function completeChat(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    maxTokens: number = 4096
): Promise<OpenAIResponse> {
    const modelMap: Record<string, string> = {
        'gpt-4-turbo': 'gpt-4-turbo-preview',
        'gpt-4': 'gpt-4',
        'gpt-3.5-turbo': 'gpt-3.5-turbo'
    };
    const model = modelMap[modelId] || modelId;

    const body = {
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: maxTokens,
        temperature: 0.3
    };

    try {
        const res = await fetch(OPENAI_CHAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });

        const data = (await res.json()) as {
            error?: { message?: string; code?: string };
            choices?: Array<{ message?: { content?: string } }>;
            usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
            model?: string;
        };

        if (!res.ok) {
            const errMsg = data.error?.message || data.error?.code || res.statusText;
            return { content: '', model, error: `OpenAI API error: ${errMsg}` };
        }

        const choice = data.choices?.[0];
        const content = choice?.message?.content?.trim() || '';
        const usage = data.usage;

        return {
            content,
            model: data.model || model,
            usage: usage ? { prompt_tokens: usage.prompt_tokens, completion_tokens: usage.completion_tokens, total_tokens: usage.total_tokens } : undefined
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: '', model, error: `Request failed: ${message}` };
    }
}
