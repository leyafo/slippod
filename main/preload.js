// preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('utils', {
  reloadAll: (...args) => ipcRenderer.invoke("reloadAll", ...args),
  unixTimeFormat: (unixTime) => unixTimeFormat(unixTime),
});


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


window.addEventListener('DOMContentLoaded', () => {
})
