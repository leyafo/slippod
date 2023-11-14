const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('fs', {
  filePicker: function(...args) {
    return ipcRenderer.invoke("filePicker", ...args);
  },
  getDBPath: function(...args){
    return ipcRenderer.invoke("getDBPath", ...args);
  },
})