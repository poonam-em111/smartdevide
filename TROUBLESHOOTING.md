# SmartDevIDE – Commands not working

If **no SmartDevIDE commands run** (Command Palette, keybindings, or right‑click), try this:

---

## Quick reference: all commands

Open Command Palette: **Mac** `Cmd+Shift+P` | **Windows/Linux** `Ctrl+Shift+P` → type **SmartDevIDE**.

| Command | Shortcut (Mac) | Shortcut (Win/Linux) |
|--------|----------------|----------------------|
| SmartDevIDE: Select Role | — | — |
| SmartDevIDE: Select Model | — | — |
| SmartDevIDE: Generate Code | `Cmd+Shift+G` | `Ctrl+Shift+G` |
| SmartDevIDE: Auto-Detect Role | — | — |
| SmartDevIDE: Open Demo | — | — |
| SmartDevIDE: Generate Solution | — | — |
| SmartDevIDE: Enhance Prompt | — | — |
| SmartDevIDE: Open Settings | — | — |
| SmartDevIDE: Show Status Info | — | — |

You can also right‑click in the editor → **SmartDevIDE** → **SmartDevIDE: Generate Code**.

---

## 1. Reload the window

- **Mac:** `Cmd+Shift+P` → type **Reload Window** → choose **Developer: Reload Window**
- Or close and reopen the editor.

---

## 2. Run from Command Palette (no keybinding)

- **Mac:** `Cmd+Shift+P`
- **Windows/Linux:** `Ctrl+Shift+P`
- Type: **SmartDevIDE**
- You should see: **SmartDevIDE: Select Role**, **SmartDevIDE: Generate Code**, etc.
- Click any command to run it.

If these **don’t appear**, the extension may not be installed or enabled.

---

## 3. Check the extension is enabled

- Open **Extensions** (`Cmd+Shift+X` / `Ctrl+Shift+X`)
- Search: **SmartDevIDE**
- Ensure it’s **Enabled** (not disabled)
- If it’s disabled, click **Enable**

---

## 4. Check for activation errors

- **View** → **Output**
- In the dropdown on the right, select **SmartDevIDE**
- Look for lines like:
  - `SmartDevIDE activating...` and `SmartDevIDE activated successfully.` → extension loaded
  - `Activation error: ...` → copy that message to fix or report the issue

---

## 5. Generate Code keybinding (Mac)

- **Generate Code** is bound to: **Cmd+Shift+G**
- Focus must be in the **editor** (cursor in a file), not in the sidebar or terminal.
- If **Cmd+Shift+G** does something else (e.g. Git), change it: **Code** → **Preferences** → **Keyboard Shortcuts**, search **SmartDevIDE: Generate Code**, and set your own shortcut.

---

## 6. Reinstall the extension

1. Uninstall: **Extensions** → SmartDevIDE → **Uninstall**
2. Reload the window
3. Install again from your `.vsix`: **Extensions** → **...** (top right) → **Install from VSIX...** → choose `smartdevide-2.0.1.vsix`
4. Reload the window again

---

## 7. Right‑click in the editor

- In a code file, **right‑click** in the editor.
- You should see a **SmartDevIDE** group with **SmartDevIDE: Generate Code**.
- Use that to run Generate Code without any keybinding.

---

**Summary:** Use **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows/Linux), type **SmartDevIDE**, and run a command from the list. If the list doesn’t show SmartDevIDE commands, reload, check Output for errors, and ensure the extension is enabled.
