// preload.js


// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('utils', {
  reloadAll: (...args) => ipcRenderer.invoke("reloadAll", ...args)
});

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  handleCounter: (callback) => ipcRenderer.on('update-counter', callback)
})


function exposeDBFunctions(exposeFunctionNames) {
  const backendFunctions = {};

  exposeFunctionNames.forEach((funcName) => {
    backendFunctions[funcName] = (...args) => ipcRenderer.invoke(funcName, ...args);
  });

  contextBridge.exposeInMainWorld('db', backendFunctions);
}


exposeDBFunctions([
  "getCards",
  "createNewCard", 
  "getAllTags",
  "getCardsByTag",
  "getCardByID",
  "deleteCardByID",
  "editCardByID",
  "getCardDetails",
  "searchCards",
])

