const { contextBridge, ipcRenderer } = require('electron')
let fs = require('fs')

contextBridge.exposeInMainWorld('Access', {
    close: () => {
        ipcRenderer.invoke('closeBrowserWindow')
    },
    maximize: () => {
        ipcRenderer.invoke('maximizeBrowserWindow')
    },
    minimize: () => {
        ipcRenderer.invoke('minimizeBrowserWindow')
    },
    tryMoveWindowToCursorMonitor: () => {
        ipcRenderer.invoke('tryMoveWindowToCursorMonitor')
    },
    getSigns: () => {
        return fs.readdirSync('app/renderer/public/signs')
    },
    openTextureDialog: () => {
        return ipcRenderer.invoke('openTextureDialog')
    },
    openBrowserLink: (link) => {
        ipcRenderer.invoke('openBrowserLink', link)
    }
})


require('./rustutils.js')
