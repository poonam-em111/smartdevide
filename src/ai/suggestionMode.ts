import * as vscode from 'vscode';

export type SuggestionMode = 'safe' | 'minimal' | 'verbose';

const MODE_INSTRUCTIONS: Record<SuggestionMode, string> = {
    safe: `Suggestion mode: SAFE. Use only well-documented, standard APIs and framework methods that actually exist. Do not invent or hallucinate method names, classes, or APIs. When uncertain, suggest the most conservative, minimal option that is guaranteed to work. Prefer 1-2 line suggestions.`,
    minimal: `Suggestion mode: MINIMAL. Suggest the shortest possible completion (1 line when possible). Avoid long blocks; they are riskier. No speculative or invented APIs.`,
    verbose: `Suggestion mode: VERBOSE. May suggest longer blocks if they are clearly correct. Still prefer real, documented APIs only; do not invent methods.`
};

const ANTI_HALLUCINATION = `Do not hallucinate or make up APIs, functions, or class names. Use only real, existing APIs from the language standard library or the project's framework (e.g. Laravel, React). Prefer short, precise suggestions over long risky blocks.`;

/**
 * Get the suggestion-mode and reasoning-hint instructions to append to the system prompt.
 */
export function getSuggestionModeInstructions(context: 'inline' | 'generate' | 'fix'): string {
    const config = vscode.workspace.getConfiguration('smartdevide');
    const mode = (config.get<string>('suggestionMode', 'safe') || 'safe') as SuggestionMode;
    const validMode: SuggestionMode = MODE_INSTRUCTIONS[mode] ? mode : 'safe';
    const reasoningHint = config.get<boolean>('suggestionReasoningHint', false);

    const parts: string[] = [ANTI_HALLUCINATION, MODE_INSTRUCTIONS[validMode]];
    if (reasoningHint && (context === 'inline' || context === 'generate')) {
        parts.push('When helpful, add a single short comment above the first line of the suggestion as a reasoning hint (e.g. // uses Array.map, or // Laravel Eloquent). Keep the hint to a few words.');
    }
    return parts.join(' ');
}
