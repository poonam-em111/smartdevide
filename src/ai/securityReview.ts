import * as vscode from 'vscode';
import { completeChat, ChatMessage } from './openaiClient';
import { getOpenAIKey } from './codeGenerator';
import { quickScan } from './security';

const SECURITY_REVIEWER_SYSTEM = `You are a security-focused code reviewer. Analyze the provided code snippet for:

1. **SQL injection** – User input (e.g. $_GET, $_POST, request params) concatenated into SQL. Recommend parameterized queries / prepared statements.
2. **Insecure auth** – Plain-text or weak hashing (MD5, SHA1) for passwords; missing CSRF; session issues. Recommend password_hash/bcrypt, CSRF tokens.
3. **Hardcoded secrets** – API keys, passwords, tokens in source. Recommend environment variables or secure config.
4. **Other** – XSS, path traversal, insecure deserialization, or missing validation where relevant.

Output a short markdown report: for each finding give severity (High/Medium/Low), what’s wrong, and a one-line fix or recommendation. If nothing stands out, say "No obvious issues found." Keep it concise.`;

export async function runSecurityReview(
    document: vscode.TextDocument,
    range: vscode.Range | undefined,
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

    const code = range ? document.getText(range) : document.getText();
    const languageId = document.languageId;
    const scanHints = quickScan(code);

    const userContent = `Language: ${languageId}\n\nCode to review:\n\`\`\`\n${code}\n\`\`\`\n${scanHints.length ? `\nQuick-scan hints (check these):\n${scanHints.map(h => `- ${h}`).join('\n')}\n` : ''}\n\nProvide a short security review (markdown).`;

    const messages: ChatMessage[] = [
        { role: 'system', content: SECURITY_REVIEWER_SYSTEM },
        { role: 'user', content: userContent }
    ];

    try {
        const result = await completeChat(apiKey, modelId, messages, 1024);
        if (result.error || !result.content?.trim()) {
            vscode.window.showErrorMessage(`SmartDevIDE: ${result.error || 'No review returned'}`);
            if (result.error) outputChannel.appendLine(`[SecurityReview] ${result.error}`);
            return;
        }
        const report = `# SmartDevIDE: Security Review\n\n**File:** ${document.fileName}\n**Language:** ${languageId}\n\n---\n\n${result.content.trim()}`;
        const doc = await vscode.workspace.openTextDocument({ content: report, language: 'markdown' });
        await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.Beside });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        outputChannel.appendLine(`[SecurityReview] ${msg}`);
        vscode.window.showErrorMessage(`SmartDevIDE: ${msg}`);
    }
}
