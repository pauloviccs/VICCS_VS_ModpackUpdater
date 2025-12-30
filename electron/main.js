import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import os from 'os'
import { fileURLToPath } from 'url'
import { setupHandlers } from './handlers/updater'

// ESM Path Fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GLOBAL ERROR HANDLER
process.on('uncaughtException', (error) => {
    dialog.showErrorBox('Erro Crítico no Updater', `Ocorreu um erro inesperado:\n${error.stack || error.message}`);
});

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win = null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        width: 900,
        height: 600,
        // ⚠️ DEBUG MODE: Frame ON, Transparent OFF, Background Color set
        frame: true,
        transparent: false,
        backgroundColor: '#1a1a1a',
        resizable: true,
        icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            backgroundThrottling: false,
        },
    })

    // Remove default menu for cleaner look (optional, keep for debug if needed)
    win.removeMenu();

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
        win.webContents.openDevTools({ mode: 'detach' })
    } else {
        win.loadFile(path.join(process.env.DIST, 'index.html'))
    }

    // Window Controls IPC
    ipcMain.on('window-minimize', () => win?.minimize())
    ipcMain.on('window-close', () => win?.close())
}

app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
    if (win) {
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

// Setup backend handlers
setupHandlers()
    .then(() => console.log('Handlers initialized'))
    .catch(console.error);

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    } else {
        createWindow()
    }
})

app.whenReady().then(createWindow)
