const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('license', {
  register: (...args) =>ipcRenderer.invoke("register", ...args),
})