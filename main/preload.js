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

function unixTimeFormat(unixTime){
    const d = new Date(unixTime*1000);
    return `${d.getFullYear}-${d.getMonth()}-${d.getDay} ${d.getHours()}:${d.getMinutes()}`;
}

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

