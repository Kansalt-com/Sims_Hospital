# INSTALL.md

## SIMS Hospital Desktop Installer (Windows)

This repository can generate a standard Windows installer EXE for **SIMS Hospital** using Electron + electron-builder.

## 1) Build Prerequisites (Dev Machine)

- Windows 10/11
- Node.js LTS (v20+ recommended)
- npm (comes with Node)

No system Node/Python is required on end-user machines after installation.

## 2) Build Commands

Run from repo root:

```powershell
npm install
npm run build:frontend
npm run build:backend
npm run build:win
```

If dependencies were partially installed earlier, run this clean recovery sequence first:

```powershell
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path backend\node_modules) { Remove-Item -Recurse -Force backend\node_modules }
if (Test-Path frontend\node_modules) { Remove-Item -Recurse -Force frontend\node_modules }
if (Test-Path desktop-electron\node_modules) { Remove-Item -Recurse -Force desktop-electron\node_modules }
npm.cmd install
```

If PowerShell blocks `npm.ps1` due execution policy, use `npm.cmd` instead:

```powershell
npm.cmd install
npm.cmd run build:frontend
npm.cmd run build:backend
npm.cmd run build:win
```

Installer output:

- `dist/installer/SIMS-Hospital-Setup-<version>.exe`

## 3) What Installer Creates

- Desktop shortcut: **SIMS Hospital**
- Start Menu shortcut: **SIMS Hospital**
- Uninstaller entry in **Apps & Features**
- Optional launch checkbox after install (Launch SIMS Hospital)

## 4) Runtime Data Paths (Installed App)

Per-user runtime storage:

- Database: `%APPDATA%\SIMS Hospital\data\sims.db`
- Uploads/logo: `%APPDATA%\SIMS Hospital\uploads\`
- Logs: `%APPDATA%\SIMS Hospital\logs\`

No writes are performed inside Program Files.

## 5) First Run Behavior

On first launch, SIMS Hospital desktop app will:

1. Start backend on localhost (default `43110`, auto-fallback to free port).
2. Auto-apply SQL migrations from packaged `backend/prisma/migrations`.
3. Optionally bootstrap the first admin from environment variables before first launch:
   - `INITIAL_ADMIN_NAME`
   - `INITIAL_ADMIN_USERNAME`
   - `INITIAL_ADMIN_PASSWORD`
   - The account is forced to change password on first login.
4. Open in Electron window and also open default browser URL.

## 6) Development Run Modes

### Web mode (existing full-stack)

```powershell
npm run dev:backend
npm run dev:frontend
```

### Desktop mode (Electron)

Build backend/frontend first, then:

```powershell
npm run dev:desktop
```

## 7) Backup / Restore

### Backup

Copy these paths to safe storage:

- `%APPDATA%\SIMS Hospital\data\sims.db`
- `%APPDATA%\SIMS Hospital\uploads\`

### Restore

1. Close SIMS Hospital.
2. Replace DB and uploads with backup copies.
3. Launch SIMS Hospital again.

## 8) Installer Scope Notes

NSIS is configured with `oneClick=false` and `allowElevation=true`:

- User can install without admin (per-user install).
- User can choose elevated/per-machine install when needed.

## 9) Branding Assets

Desktop/installer icon file:

- `desktop-electron/build/icon.ico`

Replace this file with final production icon if needed.

## 10) Install Troubleshooting

- If `npm install` fails inside root postinstall, run:

```powershell
npm.cmd run install:deps
```

- If `tsc` is not found, dependency install did not complete. Re-run:

```powershell
npm.cmd install
```

- If `electron-builder` is not found, ensure desktop dependencies are installed:

```powershell
cd desktop-electron
npm.cmd install
cd ..
```
