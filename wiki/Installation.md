# Installation

How to install SmartDevIDE in **VS Code** and **Cursor**.

---

## Prerequisites

- **VS Code** or **Cursor**
- A **SmartDevIDE VSIX** file (e.g. `smartdevide-2.0.2.vsix` from the [Releases](https://github.com/poonam-em111/smartdevide/releases) or built locally with `npm run package`)

---

## Install from VSIX (VS Code)

1. Download the `.vsix` file (e.g. from Releases or build it in the repo).
2. Open **VS Code**.
3. Press **Ctrl+Shift+P** (Windows/Linux) or **Cmd+Shift+P** (Mac).
4. Run **Extensions: Install from VSIX…**.
5. Select the `.vsix` file and confirm.
6. Reload VS Code if prompted.

---

## Install from VSIX (Cursor)

1. Download the `.vsix` file.
2. Open **Cursor**.
3. **Option A – Command Palette**
   - **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows/Linux).
   - Run **Extensions: Install from VSIX…**.
   - Choose the `.vsix` file.
4. **Option B – Extensions view**
   - Open Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`).
   - Click **…** (More Actions) → **Install from VSIX…**.
   - Select the `.vsix` file.
5. Reload Cursor if prompted.

Cursor uses the same VS Code extension format, so the same VSIX works in both.

---

## After installation

1. **Select role** – `Cmd+Shift+P` / `Ctrl+Shift+P` → **SmartDevIDE: Select Role**  
2. **Select model** – **SmartDevIDE: Select Model**  
3. **Add API key** (e.g. OpenAI) – Settings → search “smartdevide” → set **OpenAI API Key**  
4. **Generate code** – `Cmd+Shift+G` or **SmartDevIDE: Generate Code** from the palette  

---

## Building the VSIX yourself

From the extension repo root:

```bash
npm install
npm run compile
npm run package
```

The VSIX is created in the project folder (e.g. `smartdevide-2.0.2.vsix`).

---

## Troubleshooting

- **Commands not found** – Reload the window: Command Palette → **Developer: Reload Window**  
- **API errors** – Check your API key in Settings and that the chosen model is enabled  
- **Cursor** – Use the same steps as VS Code; the extension is compatible  

For more help, see the main [README](https://github.com/poonam-em111/smartdevide#readme) or open an [Issue](https://github.com/poonam-em111/smartdevide/issues).
