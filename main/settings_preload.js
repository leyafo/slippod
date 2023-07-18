const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('fs', {
  filePicker: (...args) =>ipcRenderer.invoke("filePicker", ...args),
  getDBPath:(...args)=>ipcRenderer.invoke("getDBPath", ...args),
})