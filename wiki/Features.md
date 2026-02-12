# SmartDevIDE Features

Overview of what SmartDevIDE does and how it fits into your workflow.

---

## Role-based AI behavior

Switch between **8 roles**; the AI adapts its style and focus:

| Role | Focus |
|------|--------|
| Backend Developer | APIs, databases, scalability |
| Laravel Developer | Laravel, Eloquent, Blade |
| Core PHP Developer | Pure PHP, performance, security |
| React Developer | Modern React, hooks, TypeScript |
| Frontend Developer | UI/UX, styling, accessibility |
| QA Engineer | Testing, edge cases, security |
| Tech Lead | Architecture, design decisions |
| Project Manager | Planning, documentation |

---

## Multi-model support

- **OpenAI** – GPT-4 Turbo, GPT-4, GPT-3.5 Turbo  
- **Anthropic** – Claude 3 Opus, Sonnet, Haiku  
- **Google** – Gemini Pro  
- **Cursor** – Native Cursor models  

Generate Code uses OpenAI; other features can use the selected model where supported.

---

## AI suggestions & quick actions

- **Inline completions** – Ghost-text suggestions as you type  
- **Fix with AI** – Quick Fix (lightbulb) → SmartDevIDE: Fix with AI  
- **Explain** – Quick Fix → SmartDevIDE: Explain  
- **Generate Code** – Command Palette or `Cmd+Shift+G` / `Ctrl+Shift+G`  

---

## Security-first by design

- **Secure defaults** – Generated code is guided to use parameterized queries, secure auth, no hardcoded secrets  
- **Security Review** – Command **SmartDevIDE: Security Review** on a file or selection for a short report on:
  - SQL injection
  - Insecure auth (e.g. plain-text passwords)
  - Hardcoded secrets
  - XSS, path traversal, missing validation (where relevant)  

Report opens in a markdown view beside the editor.

---

## Testing & validation

- **Generate Unit Tests** – For current file or selection (Jest, PHPUnit, pytest, etc.)  
- **Generate Edge Cases** – Boundary and invalid-input tests  
- **Run Static Checks** – ESLint, `tsc --noEmit`, `php -l` on the current file  
- **Flag Untested / Risky Logic** – AI report on hard-to-test or risky patterns  

After **Generate Code**, a quick pick offers these options.

---

## Project style (never fight the style guide)

SmartDevIDE reads your project and tooling:

- **Prettier** – indent, quotes, semicolons, etc.  
- **ESLint** – rules and extends  
- **PHP-CS-Fixer** – PSR-12, Symfony, etc.  
- **Folder structure** – e.g. `src/`, `app/`, `components/`  
- **Naming** – Infers PascalCase, snake_case, kebab-case from file/folder names  

All generated or suggested code is instructed to comply and never contradict the project’s style guide.

---

## Whole-project context

- **Framework detection** – Laravel, React, Next.js, Vue, Angular from `composer.json` / `package.json`  
- **Key paths** – e.g. `app/Http`, `src/components`  
- **Respect patterns** – Matches existing naming and architecture  

Controlled by **Project Style: Enabled** in settings (on by default).

---

## Cross-IDE support

- **VS Code** – Full support  
- **Cursor** – Full support; install from the same VSIX  

See [Installation](Installation) for steps.
