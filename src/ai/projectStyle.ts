import * as vscode from 'vscode';

const MAX_FILE_SIZE = 8192;
const STYLE_HEADER = 'Project style (follow exactly; never fight this):';
const CONTEXT_HEADER = 'Project context (whole-project; use this, never break it):';
const STYLE_GUIDE_RULE = "Never fight the project's style guide. Generated code must comply with the project's linter/formatter (ESLint, Prettier, PHP-CS-Fixer) when present.";

/**
 * Read a workspace file safely; return null if missing or too large.
 */
async function readWorkspaceFile(workspaceRoot: vscode.Uri, relativePath: string): Promise<string | null> {
    try {
        const uri = vscode.Uri.joinPath(workspaceRoot, relativePath);
        const data = await vscode.workspace.fs.readFile(uri);
        if (data.length > MAX_FILE_SIZE) return null;
        return Buffer.from(data).toString('utf8');
    } catch {
        return null;
    }
}

/**
 * List top-level folder names in the workspace (for structure context).
 */
async function getFolderStructure(workspaceRoot: vscode.Uri): Promise<string[]> {
    try {
        const entries = await vscode.workspace.fs.readDirectory(workspaceRoot);
        const dirs = entries.filter(([, type]) => type === vscode.FileType.Directory).map(([name]) => name);
        return dirs.filter(d => !d.startsWith('.') && d !== 'node_modules').slice(0, 20);
    } catch {
        return [];
    }
}

/**
 * List subdirectories of a given folder (one level), e.g. app -> [Http, Models, Providers].
 */
async function getSubdirs(workspaceRoot: vscode.Uri, parent: string): Promise<string[]> {
    try {
        const uri = vscode.Uri.joinPath(workspaceRoot, parent);
        const entries = await vscode.workspace.fs.readDirectory(uri);
        const dirs = entries.filter(([, type]) => type === vscode.FileType.Directory).map(([name]) => name);
        return dirs.filter(d => !d.startsWith('.')).slice(0, 15).map(d => `${parent}/${d}`);
    } catch {
        return [];
    }
}

/** Check if a string looks like PascalCase (e.g. UserController). */
function isPascalCase(s: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(s) && s.length > 1;
}
/** Check if a string looks like snake_case. */
function isSnakeCase(s: string): boolean {
    return /^[a-z][a-z0-9_]*$/.test(s) && s.includes('_');
}
/** Check if a string looks like kebab-case. */
function isKebabCase(s: string): boolean {
    return /^[a-z][a-z0-9-]*$/.test(s) && s.includes('-');
}
/** Check if a string looks like camelCase. */
function isCamelCase(s: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(s) && /[A-Z]/.test(s);
}

/**
 * Infer naming conventions from file/folder names in key directories.
 * Lightweight: samples a few names to detect PascalCase, snake_case, kebab-case.
 */
async function inferNamingConventions(workspaceRoot: vscode.Uri): Promise<string[]> {
    const hints: string[] = [];
    const sampleDirs = ['app', 'src', 'lib', 'components', 'pages'];
    const seen = new Set<string>();

    for (const dir of sampleDirs) {
        try {
            const uri = vscode.Uri.joinPath(workspaceRoot, dir);
            const entries = await vscode.workspace.fs.readDirectory(uri);
            for (const [name] of entries.slice(0, 25)) {
                const base = name.replace(/\.[^.]+$/, '');
                if (base.length < 2 || seen.has(base)) continue;
                seen.add(base);
                if (isPascalCase(base)) hints.push('PascalCase (files/classes)');
                else if (isSnakeCase(base)) hints.push('snake_case (files)');
                else if (isKebabCase(base)) hints.push('kebab-case (files)');
                else if (isCamelCase(base)) hints.push('camelCase (files)');
            }
        } catch { /* dir may not exist */ }
    }

    const unique = [...new Set(hints)];
    if (unique.length) return [`Naming (inferred): ${unique.slice(0, 4).join(', ')}. Match existing file/class names.`];
    return [];
}

/**
 * Detect framework and key structure from composer.json, package.json, and folders.
 */
async function getFrameworkAndStructure(workspaceRoot: vscode.Uri): Promise<{ framework: string; structure: string[] }> {
    const structure: string[] = [];
    let framework = '';

    const composer = await readWorkspaceFile(workspaceRoot, 'composer.json');
    if (composer) {
        try {
            const json = JSON.parse(composer);
            const req = json.require || {};
            if (req['laravel/framework']) {
                framework = 'Laravel';
                const top = await getFolderStructure(workspaceRoot);
                if (top.includes('app')) {
                    const appSub = await getSubdirs(workspaceRoot, 'app');
                    structure.push(...appSub.filter(s => ['app/Http', 'app/Models', 'app/Services', 'app/Providers'].some(p => s.startsWith(p))));
                }
                if (top.includes('resources')) structure.push('resources/views', 'resources/js');
                if (top.includes('routes')) structure.push('routes');
                if (top.includes('config')) structure.push('config');
                if (structure.length === 0) structure.push('app', 'config', 'routes', 'resources');
            }
        } catch { /* ignore */ }
    }

    const pkg = await readWorkspaceFile(workspaceRoot, 'package.json');
    if (pkg && !framework) {
        try {
            const json = JSON.parse(pkg);
            const deps = { ...(json.dependencies || {}), ...(json.devDependencies || {}) };
            if (deps['react'] || deps['next']) {
                framework = deps['next'] ? 'Next.js' : 'React';
                const top = await getFolderStructure(workspaceRoot);
                if (top.includes('src')) {
                    const srcSub = await getSubdirs(workspaceRoot, 'src');
                    structure.push(...srcSub.filter(s => ['src/components', 'src/pages', 'src/hooks', 'src/utils', 'src/app'].some(p => s.startsWith(p))));
                }
                if (structure.length === 0) structure.push('src', 'public', 'components');
            } else if (deps['vue'] || deps['nuxt']) {
                framework = deps['nuxt'] ? 'Nuxt' : 'Vue';
                structure.push('src', 'components', 'pages', 'layouts');
            } else if (deps['@angular/core']) {
                framework = 'Angular';
                structure.push('src/app', 'src/components', 'src/services', 'src/models');
            }
        } catch { /* ignore */ }
    }

    const folders = await getFolderStructure(workspaceRoot);
    if (!framework && folders.length) {
        if (folders.includes('app') && (folders.includes('config') || folders.includes('routes'))) framework = 'Laravel-like PHP';
        else if (folders.includes('src') && (folders.includes('components') || folders.includes('app'))) framework = 'Frontend (React/Vue-like)';
    }
    if (structure.length === 0 && folders.length) structure.push(...folders.slice(0, 12));

    return { framework, structure };
}

/**
 * Extract Prettier-relevant options from JSON or JS-like content.
 */
function parsePrettierStyle(content: string): string[] {
    const lines: string[] = [];
    try {
        const json = JSON.parse(content);
        if (json.tabWidth != null) lines.push(`tabWidth ${json.tabWidth}`);
        if (json.useTabs != null) lines.push(`useTabs ${json.useTabs}`);
        if (json.singleQuote != null) lines.push(`quotes ${json.singleQuote ? 'single' : 'double'}`);
        if (json.semi != null) lines.push(`semicolons ${json.semi}`);
        if (json.printWidth != null) lines.push(`printWidth ${json.printWidth}`);
        if (json.bracketSpacing != null) lines.push(`bracketSpacing ${json.bracketSpacing}`);
        if (json.trailingComma != null) lines.push(`trailingComma ${json.trailingComma}`);
        if (json.arrowParens != null) lines.push(`arrowParens ${json.arrowParens}`);
    } catch {
        if (content.includes('singleQuote') || content.includes('single')) lines.push('quotes single');
        const m = content.match(/tabWidth[\s:]+(\d+)/);
        if (m) lines.push(`tabWidth ${m[1]}`);
        if (content.includes('trailingComma')) lines.push('trailingComma configured');
        if (content.includes('arrowParens')) lines.push('arrowParens configured');
    }
    return lines;
}

/**
 * Extract ESLint indent/quotes/semi from rules; prefer explicit values when in JSON.
 */
function parseEslintStyle(content: string): string[] {
    const lines: string[] = [];
    try {
        const json = JSON.parse(content);
        const rules = json.rules || {};
        if (rules.indent != null) {
            const v = Array.isArray(rules.indent) ? rules.indent[0] : rules.indent;
            lines.push(`indent: ${typeof v === 'number' ? v : 'configured'}`);
        } else if (content.includes('"indent"') || content.includes("'indent'")) lines.push('indent rule present');
        if (rules.quotes != null) {
            const v = Array.isArray(rules.quotes) ? rules.quotes[0] : rules.quotes;
            const q = typeof v === 'string' ? v : '';
            if (q.includes('single')) lines.push('quotes: single');
            else if (q.includes('double')) lines.push('quotes: double');
            else lines.push('quotes rule present');
        } else if (content.includes('"quotes"') || content.includes("'quotes'")) lines.push('quotes rule present');
        if (rules.semi != null) {
            const v = Array.isArray(rules.semi) ? rules.semi[0] : rules.semi;
            lines.push(`semicolons: ${v === 'always' || v === true ? 'always' : 'as-needed'}`);
        } else if (content.includes('semi')) lines.push('semi rule present');
        const extendsList = json.extends;
        if (extendsList && (Array.isArray(extendsList) ? extendsList.length : 1)) lines.push('extends configured');
    } catch {
        if (content.includes('indent') || content.includes('quotes')) lines.push('ESLint style configured');
    }
    return lines.length ? lines : ['ESLint configured'];
}

/**
 * Detect PHP-CS-Fixer rulesets and key rules (PSR-12, Symfony, etc.).
 */
function parsePhpCsFixerStyle(content: string): string[] {
    const lines: string[] = [];
    if (content.includes('@PhpCsFixer')) lines.push('@PhpCsFixer ruleset');
    if (content.includes('@Symfony') || content.includes('Symfony')) lines.push('@Symfony style');
    if (content.includes('PSR12') || content.includes('psr12') || content.includes('PSR-12')) lines.push('PSR-12');
    if (content.includes('indent')) lines.push('indent configured');
    if (lines.length === 0 && (content.includes('php-cs-fixer') || content.includes('return '))) lines.push('PHP-CS-Fixer configured');
    return lines;
}

/**
 * Build a short "project style" string from workspace configs and folder structure.
 * Used to inject into AI prompts so generated code never fights the project's style.
 */
export async function getProjectStyle(workspaceRoot: vscode.Uri | undefined): Promise<string> {
    if (!workspaceRoot) return '';
    const config = vscode.workspace.getConfiguration('smartdevide');
    if (!config.get<boolean>('projectStyle.enabled', true)) return '';

    const parts: string[] = [];

    // Prettier
    const prettierPaths = ['.prettierrc', '.prettierrc.json', '.prettierrc.yaml', '.prettierrc.yml', 'prettier.config.js', 'prettier.config.cjs'];
    for (const p of prettierPaths) {
        const content = await readWorkspaceFile(workspaceRoot, p);
        if (content) {
            const pre = parsePrettierStyle(content);
            if (pre.length) parts.push(`Prettier: ${pre.join(', ')}`);
            else parts.push('Prettier: configured (follow project formatting)');
            break;
        }
    }
    const pkgPath = 'package.json';
    const pkg = await readWorkspaceFile(workspaceRoot, pkgPath);
    if (pkg && !parts.some(s => s.startsWith('Prettier'))) {
        try {
            const json = JSON.parse(pkg);
            if (json.prettier && typeof json.prettier === 'object') {
                const pre = parsePrettierStyle(JSON.stringify(json.prettier));
                if (pre.length) parts.push(`Prettier (package.json): ${pre.join(', ')}`);
            }
        } catch { /* ignore */ }
    }

    // ESLint
    const eslintPaths = ['.eslintrc', '.eslintrc.json', '.eslintrc.js', '.eslintrc.cjs', 'eslint.config.js'];
    for (const p of eslintPaths) {
        const content = await readWorkspaceFile(workspaceRoot, p);
        if (content) {
            const es = parseEslintStyle(content);
            if (es.length) parts.push(`ESLint: ${es.join(', ')}`);
            break;
        }
    }

    // PHP-CS-Fixer
    const phpCsPaths = ['.php-cs-fixer.php', '.php-cs-fixer.dist.php', '.php_cs'];
    for (const p of phpCsPaths) {
        const content = await readWorkspaceFile(workspaceRoot, p);
        if (content) {
            const php = parsePhpCsFixerStyle(content);
            if (php.length) parts.push(php.join(', '));
            break;
        }
    }

    // Naming conventions (auto-learn from file/folder names)
    const naming = await inferNamingConventions(workspaceRoot);
    parts.push(...naming);

    // Folder structure
    const folders = await getFolderStructure(workspaceRoot);
    if (folders.length) {
        parts.push(`Folder structure: ${folders.join(', ')}`);
    }

    // Whole-project context: framework, structure, and rules to not break flows
    const { framework, structure } = await getFrameworkAndStructure(workspaceRoot);
    const contextParts: string[] = [];
    if (framework) {
        contextParts.push(`Framework: ${framework}. Use its conventions and project structure.`);
    }
    if (structure.length) {
        contextParts.push(`Key paths: ${structure.join(', ')}. Respect this layout and naming.`);
    }
    contextParts.push('Respect existing patterns, naming, and architecture. Match conventions used elsewhere in the project.');
    contextParts.push('Do not suggest code that breaks existing flows, duplicates logic, or contradicts patterns already in the project.');

    const styleBlock = parts.length > 0
        ? `${STYLE_HEADER}\n- ${parts.join('\n- ')}\n- Naming and formatting must match existing project files.\n- ${STYLE_GUIDE_RULE}`
        : '';
    const contextBlock = `${CONTEXT_HEADER}\n- ${contextParts.join('\n- ')}`;

    const contextWithRule = contextBlock + (contextBlock ? `\n- ${STYLE_GUIDE_RULE}` : '');
    if (styleBlock && contextBlock) return `${styleBlock}\n\n${contextWithRule}`;
    if (contextBlock) return contextWithRule;
    if (styleBlock) return styleBlock;
    return '';
}

/**
 * Get workspace root URI for a given document (or first folder).
 */
export function getWorkspaceRootForDocument(document: vscode.TextDocument): vscode.Uri | undefined {
    const folder = vscode.workspace.getWorkspaceFolder(document.uri);
    return folder?.uri ?? vscode.workspace.workspaceFolders?.[0]?.uri;
}
