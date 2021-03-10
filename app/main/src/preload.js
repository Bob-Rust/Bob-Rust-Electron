const { contextBridge, ipcRenderer } = require('electron')
var fs = require('fs')

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
    setResizable: (enable) => {
        ipcRenderer.invoke('setBrowserWindowResizable', enable)
    },
    tryMoveWindowToCursorMonitor: () => {
        ipcRenderer.invoke('tryMoveWindowToCursorMonitor')
    },
    getSigns: () => {
        return fs.readdirSync('app/renderer/public/signs')
    },
    openTextureDialog: () => {
        return ipcRenderer.invoke('openTextureDialog')
    }
})


require('./rustutils.js')
