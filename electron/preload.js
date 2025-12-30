import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    // Window Controls
    minimize: () => ipcRenderer.send('window-minimize'),
    close: () => ipcRenderer.send('window-close'),

    // Versions
    versions: {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron,
    },

    // Updater
    checkUpdate: () => ipcRenderer.invoke('check-update'),
    startUpdate: () => ipcRenderer.invoke('start-update'),
    getConfig: () => ipcRenderer.invoke('get-config'),
    selectFolder: () => ipcRenderer.invoke('select-folder'),

    // Events
    onProgress: (callback) => {
        const listener = (event, data) => callback(data);
        ipcRenderer.on('update-progress', listener);
        // Return cleanup function
        return () => ipcRenderer.removeListener('update-progress', listener);
    },
    removeProgressListeners: () => ipcRenderer.removeAllListeners('update-progress'),
})
