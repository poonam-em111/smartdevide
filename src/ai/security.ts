/**
 * Security-first defaults and security review for SmartDevIDE.
 */

/** Instruction block to prefer secure defaults in all generated code. */
export const SECURITY_PROMPT_BLOCK = `Security (prefer secure defaults): Use parameterized queries or prepared statements—never concatenate user input into SQL. For auth use secure hashing (e.g. password_hash, bcrypt) and CSRF protection. Do not output hardcoded secrets, API keys, or passwords. Prefer secure defaults in generated code.`;

/**
 * Quick heuristic scan for obvious risks. Returns short labels for the AI context.
 */
export function quickScan(code: string): string[] {
    const hints: string[] = [];
    const lower = code.toLowerCase();
    if ((lower.includes('select ') || lower.includes('insert ') || lower.includes('delete ') || lower.includes('update ')) &&
        (code.includes('$_GET') || code.includes('$_POST') || code.includes('+') && code.includes('"') && lower.includes('where'))) {
        hints.push('Possible SQL injection risk: raw query with user input (e.g. $_GET/$_POST). Use prepared statements.');
    }
    if (lower.includes('password') && (lower.includes('=') || lower.includes('md5') || lower.includes('sha1')) && !lower.includes('password_hash') && !lower.includes('bcrypt')) {
        hints.push('Possible insecure auth: password stored or compared without password_hash/bcrypt.');
    }
    if (/\b(api[_-]?key|secret|password)\s*=\s*['\"][^'\"]+['\"]/i.test(code) || /sk-[a-zA-Z0-9]{20,}/.test(code)) {
        hints.push('Possible hardcoded secret: API key, password, or token in plain text. Use env vars or config.');
    }
    return hints;
}
