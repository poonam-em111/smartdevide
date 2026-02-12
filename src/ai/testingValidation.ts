import * as vscode from 'vscode';
import { completeChat, ChatMessage } from './openaiClient';
import { getOpenAIKey } from './codeGenerator';
import * as path from 'path';

const UNIT_TEST_SYSTEM = `You are an expert at writing unit tests. Given code (or a selection), generate focused unit tests that:

1. Cover the main behavior and public API.
2. Use the project's test framework if detectable (e.g. Jest, Vitest, PHPUnit, pytest); otherwise choose the standard for the language.
3. Follow the project's style (same language, naming, and structure as the rest of the codebase).
4. Keep tests clear and maintainable; one logical assertion per test when practical.

Output only the test code in a single block, with minimal commentary. If the snippet is too small to test meaningfully, suggest a short test file structure and one example test.`;

const EDGE_CASE_SYSTEM = `You are an expert at finding and testing edge cases. Given code (or a selection), generate test cases that cover:

1. **Boundaries** – Empty input, null/undefined, zero, negative numbers, max length, empty arrays/strings.
2. **Invalid input** – Wrong types, malformed data, missing required fields.
3. **Edge behavior** – First/last element, single element, duplicates, whitespace-only strings.
4. **Error paths** – Exceptions, error returns, validation failures.

Use the project's test framework when obvious (Jest, PHPUnit, pytest, etc.). Output test code in a single block with brief comments per case. Keep it concise.`;

const FLAG_RISKY_SYSTEM = `You are a QA-focused reviewer. Analyze the provided code and flag:

1. **Untested or hard-to-test logic** – Complex conditionals, global state, side effects, no clear seams for mocking.
2. **Risky patterns** – Unchecked null/undefined, missing error handling, silent failures, race conditions, resource leaks.
3. **Missing edge-case handling** – No validation of inputs, no handling of empty/negative/overflow cases.
4. **Fragile or opaque code** – Magic numbers, deep nesting, unclear invariants that could break under change.

Output a short markdown report: for each finding give severity (High/Medium/Low), location (e.g. "line 12"), what's risky, and a one-line recommendation. If nothing stands out, say "No obvious untested or risky logic found." Keep it concise.`;

/**
 * Generate unit tests for the given document/range using the current model.
 */
export async function generateUnitTests(
    document: vscode.TextDocument,
    range: vscode.Range | undefined,
    getModelId: () => string,
    outputChannel: vscode.OutputChannel
): Promise<string | undefined> {
    const apiKey = getOpenAIKey();
    if (!apiKey?.trim()) {
        vscode.window.showErrorMessage('SmartDevIDE: No API key. Set smartdevide.models.openai.apiKey.');
        return undefined;
    }
    let modelId = getModelId();
    if (!/^gpt-/.test(modelId)) modelId = 'gpt-4-turbo';

    const code = range ? document.getText(range) : document.getText();
    const languageId = document.languageId;
    const userContent = `Language: ${languageId}\n\nCode to test:\n\`\`\`\n${code}\n\`\`\`\n\nGenerate unit tests for this code. Output only the test code.`;

    const messages: ChatMessage[] = [
        { role: 'system', content: UNIT_TEST_SYSTEM },
        { role: 'user', content: userContent }
    ];

    try {
        const result = await completeChat(apiKey, modelId, messages, 4096);
        if (result.error || !result.content?.trim()) {
            vscode.window.showErrorMessage(`SmartDevIDE: ${result.error || 'No tests generated'}`);
            if (result.error) outputChannel.appendLine(`[Testing] ${result.error}`);
            return undefined;
        }
        return result.content.trim();
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        outputChannel.appendLine(`[Testing] ${msg}`);
        vscode.window.showErrorMessage(`SmartDevIDE: ${msg}`);
        return undefined;
    }
}

/**
 * Generate edge-case tests for the given document/range.
 */
export async function generateEdgeCases(
    document: vscode.TextDocument,
    range: vscode.Range | undefined,
    getModelId: () => string,
    outputChannel: vscode.OutputChannel
): Promise<string | undefined> {
    const apiKey = getOpenAIKey();
    if (!apiKey?.trim()) {
        vscode.window.showErrorMessage('SmartDevIDE: No API key. Set smartdevide.models.openai.apiKey.');
        return undefined;
    }
    let modelId = getModelId();
    if (!/^gpt-/.test(modelId)) modelId = 'gpt-4-turbo';

    const code = range ? document.getText(range) : document.getText();
    const languageId = document.languageId;
    const userContent = `Language: ${languageId}\n\nCode to cover with edge cases:\n\`\`\`\n${code}\n\`\`\`\n\nGenerate edge-case tests. Output only the test code.`;

    const messages: ChatMessage[] = [
        { role: 'system', content: EDGE_CASE_SYSTEM },
        { role: 'user', content: userContent }
    ];

    try {
        const result = await completeChat(apiKey, modelId, messages, 4096);
        if (result.error || !result.content?.trim()) {
            vscode.window.showErrorMessage(`SmartDevIDE: ${result.error || 'No edge-case tests generated'}`);
            if (result.error) outputChannel.appendLine(`[Testing] ${result.error}`);
            return undefined;
        }
        return result.content.trim();
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        outputChannel.appendLine(`[Testing] ${msg}`);
        vscode.window.showErrorMessage(`SmartDevIDE: ${msg}`);
        return undefined;
    }
}

/**
 * Flag untested or risky logic in the given document/range (AI analysis).
 */
export async function flagUntestedOrRisky(
    document: vscode.TextDocument,
    range: vscode.Range | undefined,
    getModelId: () => string,
    outputChannel: vscode.OutputChannel
): Promise<void> {
    const apiKey = getOpenAIKey();
    if (!apiKey?.trim()) {
        vscode.window.showErrorMessage('SmartDevIDE: No API key. Set smartdevide.models.openai.apiKey.');
        return;
    }
    let modelId = getModelId();
    if (!/^gpt-/.test(modelId)) modelId = 'gpt-4-turbo';

    const code = range ? document.getText(range) : document.getText();
    const languageId = document.languageId;
    const userContent = `Language: ${languageId}\n\nCode to analyze:\n\`\`\`\n${code}\n\`\`\`\n\nFlag untested or risky logic. Output a short markdown report.`;

    const messages: ChatMessage[] = [
        { role: 'system', content: FLAG_RISKY_SYSTEM },
        { role: 'user', content: userContent }
    ];

    try {
        const result = await completeChat(apiKey, modelId, messages, 1024);
        if (result.error || !result.content?.trim()) {
            vscode.window.showErrorMessage(`SmartDevIDE: ${result.error || 'No analysis returned'}`);
            if (result.error) outputChannel.appendLine(`[Testing] ${result.error}`);
            return;
        }
        const report = `# SmartDevIDE: Untested / Risky Logic\n\n**File:** ${document.fileName}\n**Language:** ${languageId}\n\n---\n\n${result.content.trim()}`;
        const doc = await vscode.workspace.openTextDocument({ content: report, language: 'markdown' });
        await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.Beside });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        outputChannel.appendLine(`[Testing] ${msg}`);
        vscode.window.showErrorMessage(`SmartDevIDE: ${msg}`);
    }
}

export interface StaticCheckResult {
    tool: string;
    ok: boolean;
    output: string;
    error?: string;
}

/**
 * Run static checks on the current file (ESLint, tsc, php -l) when available.
 * Returns a summary for display; does not modify the document.
 */
export async function runStaticChecks(
    workspaceRoot: vscode.Uri,
    document: vscode.TextDocument,
    outputChannel: vscode.OutputChannel
): Promise<StaticCheckResult[]> {
    const results: StaticCheckResult[] = [];
    const rootPath = workspaceRoot.fsPath;
    const filePath = document.uri.fsPath;
    const ext = path.extname(filePath).toLowerCase();
    const relPath = path.relative(rootPath, filePath).split(path.sep).join('/');

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const run = async (cmd: string, cwd: string): Promise<{ stdout: string; stderr: string }> => {
        try {
            return await execAsync(cmd, { cwd, maxBuffer: 512 * 1024 });
        } catch (e: unknown) {
            const err = e as { stdout?: string; stderr?: string };
            return { stdout: err.stdout ?? '', stderr: err.stderr ?? String(e) };
        }
    };

    // ESLint (JS/TS/Vue etc.)
    if (['.js', '.jsx', '.ts', '.tsx', '.vue', '.mjs', '.cjs'].includes(ext)) {
        const { stdout, stderr } = await run(`npx eslint "${relPath}" --no-error-on-unmatched-pattern 2>&1`, rootPath);
        const out = (stdout || stderr || '').trim();
        const ok = !out || out.includes('0 problems');
        results.push({ tool: 'ESLint', ok, output: out || 'No issues.', error: ok ? undefined : out });
    }

    // TypeScript (tsc --noEmit for .ts/.tsx)
    if (['.ts', '.tsx'].includes(ext)) {
        const { stdout, stderr } = await run('npx tsc --noEmit 2>&1', rootPath);
        const out = (stdout || stderr || '').trim();
        const ok = !out;
        results.push({ tool: 'TypeScript (tsc)', ok, output: out || 'No type errors.', error: ok ? undefined : out });
    }

    // PHP syntax check
    if (ext === '.php') {
        const { stdout, stderr } = await run(`php -l "${filePath}" 2>&1`, rootPath);
        const out = (stdout || stderr || '').trim();
        const ok = out.includes('No syntax errors');
        results.push({ tool: 'PHP (php -l)', ok, output: out, error: ok ? undefined : out });
    }

    if (results.length === 0) {
        results.push({ tool: 'Static checks', ok: true, output: `No runner configured for ${ext}. Use ESLint/Prettier/PHP-CS-Fixer from the command line if needed.` });
    }

    for (const r of results) {
        outputChannel.appendLine(`[StaticCheck] ${r.tool}: ${r.ok ? 'OK' : 'Issues'}`);
        if (r.output) outputChannel.appendLine(r.output);
    }
    return results;
}

/**
 * Show static check results in a quick message and optionally in the output channel.
 */
export function showStaticCheckResults(results: StaticCheckResult[], outputChannel: vscode.OutputChannel): void {
    const failed = results.filter(r => !r.ok);
    if (failed.length === 0) {
        vscode.window.showInformationMessage(`SmartDevIDE: Static checks passed (${results.map(r => r.tool).join(', ')}).`);
        return;
    }
    const msg = failed.map(r => `${r.tool}: ${(r.error || r.output).split('\n')[0]}`).join('; ');
    vscode.window.showWarningMessage(`SmartDevIDE: Static check issues: ${msg}`, 'Show Output').then(choice => {
        if (choice === 'Show Output') {
            outputChannel.show();
        }
    });
}
