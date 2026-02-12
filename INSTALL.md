# BehaviourAI Extension - Quick Installation Guide

## ✅ Extension Package Created

**File**: `C:\Projects\aiexstension\smartdevide-1.0.0.vsix`  
**Size**: 24.62 KB  
**Status**: Ready to install

## Installation Steps

### Option 1: Command Line (Fastest)

```powershell
cd C:\Projects\aiexstension
code --install-extension smartdevide-1.0.0.vsix
```

### Option 2: VS Code GUI

1. Open VS Code
2. Press `Ctrl+Shift+P` to open Command Palette
3. Type: `Extensions: Install from VSIX`
4. Navigate to: `C:\Projects\aiexstension\smartdevide-1.0.0.vsix`
5. Click **Install**
6. Reload VS Code when prompted

### Option 3: Drag & Drop

1. Open VS Code
2. Open Extensions panel (`Ctrl+Shift+X`)
3. Drag `smartdevide-1.0.0.vsix` onto the Extensions panel

## First Time Setup

After installation:

1. **Welcome Message**: You'll see a welcome notification
   - Click "Select Role" to choose your developer role
   - Or click "Open Demo" to see the interactive demo

2. **Status Bar**: Look for 🎯 in the bottom-right status bar
   - Click it anytime to change your role
   - Shows your current role (e.g., "🎯 Backend Developer")

3. **Open the Demo**: Press `Ctrl+Shift+P` and type:
   - `SmartDevIDE: Open Demo` - Interactive demo panel
   - `SmartDevIDE: Select Role` - Change your role
   - `SmartDevIDE: Generate Solution` - Quick access to demo

## Testing the Extension

### Test 1: Role Selection
1. Click the 🎯 status bar item
2. Select "Backend Developer"
3. Verify status bar updates to "🎯 Backend Developer"

### Test 2: Demo Panel
1. Press `Ctrl+Shift+P`
2. Type: "SmartDevIDE: Open Demo"
3. In the demo panel:
   - Select "Generate user creation solution" from dropdown
   - See backend-focused code with transactions, caching, events
4. Change role to "Frontend Developer"
5. Select same command again
6. See UI component with React, forms, validation

### Test 3: Role Persistence
1. Close VS Code
2. Reopen VS Code
3. Check status bar - your selected role should be remembered

## Available Commands

All commands are accessible via `Ctrl+Shift+P`:

- **SmartDevIDE: Select Role** - Choose developer role
- **SmartDevIDE: Open Demo** - Interactive code demo
- **SmartDevIDE: Generate Solution** - Quick demo access

## Roles Available

- 🔧 **Backend Developer** - Production code, databases, scalability
- 🎨 **Frontend Developer** - UI components, React, user experience
- 🧪 **QA Engineer** - Tests, edge cases, security validation
- 🏗️ **Tech Lead** - Architecture, design decisions, trade-offs

## Demo Commands

Try these commands in the demo panel to see role-specific outputs:

1. **Generate user creation solution**
2. **Build REST API endpoint**
3. **Implement authentication**
4. **Optimize component**

Each command produces completely different code based on your selected role!

## Troubleshooting

**Extension not showing up?**
- Reload VS Code: `Ctrl+Shift+P` → "Reload Window"
- Check Extensions panel: `Ctrl+Shift+X` → Search "SmartDevIDE"

**Commands not appearing?**
- Make sure extension is activated (check status bar for 🎯)
- Reload window if just installed

**Want to uninstall?**
- Extensions panel → SmartDevIDE → Uninstall

## What's Next?

This POC demonstrates the core concept. In a production version:
- Static templates → Real AI API integration
- 4 roles → Unlimited custom roles
- Demo only → Full code generation throughout IDE
- Solo use → Team collaboration with shared roles

---

**Questions or feedback?** The extension is ready to demonstrate role-based AI behavior control!
