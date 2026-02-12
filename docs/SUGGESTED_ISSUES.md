# Suggested GitHub Issues for SmartDevIDE

Use these as **titles** and **bodies** when you click **New issue** on the [Issues](https://github.com/poonam-em111/smartdevide/issues) page. Copy the block under each heading into the issue form.

---

## Issue 1: Document Security Review in Wiki

**Title:** `Document Security Review in Wiki`

**Body:**
```markdown
## Summary
Add a short Wiki (or README) section that explains the Security Review feature and when to use it.

## Details
- Security Review scans code for SQL injection, hardcoded secrets, insecure auth, XSS/path traversal.
- It can be run from Command Palette or editor context menu (SmartDevIDE: Security Review).
- A markdown report opens beside the editor with severity and one-line recommendations.

## Acceptance
- [ ] Wiki or README has a "Security Review" subsection
- [ ] Steps to run the command are clear
- [ ] What the report contains is briefly described
```

---

## Issue 2: Document Testing & Validation (unit tests, edge cases, static checks)

**Title:** `Document Testing & Validation features in Wiki`

**Body:**
```markdown
## Summary
Document the built-in Testing & Validation features so users know they can generate unit tests, edge cases, run static checks, and flag risky logic.

## Details
- **Generate Unit Tests** – for current file or selection
- **Generate Edge Cases** – boundaries, invalid input, error paths
- **Run Static Checks** – ESLint, tsc, php -l on current file
- **Flag Untested / Risky Logic** – AI report on hard-to-test or risky patterns
- After Generate Code, a quick pick offers these options.

## Acceptance
- [ ] Wiki or README describes all four features
- [ ] How to run each (Command Palette / context menu) is clear
- [ ] Post–Generate Code quick pick is mentioned
```

---

## Issue 3: Add configuration to toggle "Offer testing after Generate Code"

**Title:** `Add setting to toggle "Offer testing after Generate Code"`

**Body:**
```markdown
## Summary
After Generate Code, a quick pick appears offering unit tests, edge cases, static checks, or flag risky logic. Some users may want to disable this prompt.

## Proposed solution
- Add a setting e.g. `smartdevide.testing.offerAfterGenerateCode` (boolean, default `true`).
- When `false`, do not show the quick pick after Generate Code; the four actions remain available via Command Palette / context menu.

## Acceptance
- [ ] Setting exists and is documented in package.json contributions
- [ ] When enabled (default), quick pick shows after successful Generate Code insert
- [ ] When disabled, no quick pick; other testing commands unchanged
```

---

## Issue 4: Publish extension to VS Code Marketplace

**Title:** `Publish SmartDevIDE to VS Code Marketplace`

**Body:**
```markdown
## Summary
Allow users to install SmartDevIDE from the VS Code Marketplace instead of only from a VSIX file.

## Tasks
- [ ] Create/use a publisher account on [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
- [ ] Ensure package.json has correct publisher, name, displayName, description
- [ ] Run `vsce publish` (or use CI) to publish
- [ ] Update README with "Install from Marketplace" steps
- [ ] Optionally add Open VSX for Cursor / other editors
```

---

## Issue 5: Enable GitHub Discussions for the repo

**Title:** `Enable GitHub Discussions`

**Body:**
```markdown
## Summary
Enable the Discussions tab for this repository so the community can ask questions, share ideas, and discuss features without opening formal issues.

## Steps (for maintainers)
1. Go to **Settings** of the repo.
2. Under **General** → **Features**, check **Discussions**.
3. Optionally create categories (e.g. Ideas, Q&A, Announcements).
4. Add a link to Discussions in the README and Wiki Home.
```

---

## Issue 6: Improve static check support for projects without ESLint/tsc

**Title:** `Improve Run Static Checks when ESLint/tsc not in project`

**Body:**
```markdown
## Summary
**SmartDevIDE: Run Static Checks** runs ESLint, tsc, or php -l when the project has those tools. When none are configured, the user only sees a generic "No runner configured" message.

## Proposed improvement
- If no tool runs, suggest in the message how to add ESLint/Prettier/php -l (one line or link).
- Optionally detect `package.json` scripts (e.g. `lint`, `check`) and run those when present.
```

---

## How to use this file

1. Open [github.com/poonam-em111/smartdevide/issues](https://github.com/poonam-em111/smartdevide/issues).
2. Click **New issue**.
3. Pick a suggested issue above: copy the **Title** into the issue title and the **Body** (inside the code block) into the issue body.
4. Add labels (e.g. documentation, enhancement) if your repo uses them.
5. Submit the issue.
```
