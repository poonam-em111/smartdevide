# How to Generate Extension File (.vsix) for VS Code and Cursor

The **same .vsix file** works for both **VS Code** and **Cursor** (Cursor is built on VS Code and uses the same extension format).

---

## Quick steps

### 1. Install dependencies

```bash
cd "/Applications/XAMPP/xamppfiles/htdocs/IDE Extension"
npm install
```

### 2. Compile TypeScript

```bash
npm run compile
```

### 3. Create the .vsix package

```bash
npm run package
```

### 4. Output

The command creates:

**`smartdevide-2.0.0.vsix`** in the project root (about 82 KB).

---

## One-line build

```bash
cd "/Applications/XAMPP/xamppfiles/htdocs/IDE Extension" && npm install && npm run package
```

---

## Install the extension

### In VS Code

**Option A – Command line**

```bash
code --install-extension "/Applications/XAMPP/xamppfiles/htdocs/IDE Extension/smartdevide-2.0.0.vsix"
```

**Option B – From the editor**

1. Open VS Code.
2. `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac).
3. Run: **Extensions: Install from VSIX...**
4. Choose `smartdevide-2.0.0.vsix`.
5. Reload the window if asked.

### In Cursor

**Option A – Command line**

```bash
cursor --install-extension "/Applications/XAMPP/xamppfiles/htdocs/IDE Extension/smartdevide-2.0.0.vsix"
```

**Option B – From the editor**

1. Open Cursor.
2. `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac).
3. Run: **Extensions: Install from VSIX...**
4. Choose `smartdevide-2.0.0.vsix`.
5. Reload the window if asked.

---

## NPM scripts

| Command            | Description                          |
|--------------------|--------------------------------------|
| `npm run compile`  | Compile TypeScript → `out/`          |
| `npm run watch`    | Compile and watch for changes        |
| `npm run package`  | Build and create `.vsix` (recommended) |

`npm run package` runs the compile step and then packages the extension.

---

## If compile fails

1. **Permission errors on `tsc`**

   ```bash
   chmod +x node_modules/.bin/tsc
   npm run compile
   ```

2. **Template/type errors**

   Some template files are excluded in `tsconfig.json` to keep the build passing. The extension still ships with the previously compiled template JS in `out/`. To change and rebuild those templates later, fix any template literal/escaping issues and remove their entries from `exclude` in `tsconfig.json`.

3. **Missing LICENSE**

   A `LICENSE` file is in the project. If you see a license warning, ensure `LICENSE` exists in the extension root.

---

## File layout after build

```
IDE Extension/
├── smartdevide-2.0.0.vsix   ← Install this in VS Code or Cursor
├── out/                     ← Compiled JavaScript
│   ├── extension.js
│   ├── roleManager.js
│   ├── demoPanel.js
│   └── ...
├── package.json
├── src/
└── ...
```

---

## Summary

- One .vsix for both VS Code and Cursor.
- Build: `npm run package` → produces `smartdevide-2.0.0.vsix`.
- Install in VS Code: `code --install-extension path/to/smartdevide-2.0.0.vsix` or use **Install from VSIX** in the UI.
- Install in Cursor: `cursor --install-extension path/to/smartdevide-2.0.0.vsix` or use **Install from VSIX** in the UI.
