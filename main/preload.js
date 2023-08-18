// preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('utils', {
  reloadAll: (...args) => ipcRenderer.invoke("reloadAll", ...args),
  uploadCardEditing: (id, entry) => ipcRenderer.invoke("uploadCardEditing", id, entry),
});


(function(){
  const listDBFunctions = [
    "getCards",
    "searchCards",
    "getCardsByTag",
    "getTrashCards",
    "getNoTagCards",
    "getCardsByMiddleID",
  ]
  const otherDBFunctions = [
    "createNewCard", 
    "getAllTags",
    "getCardByID",
    "deleteCardByID",
    "updateCardEntryByID",
    "getCardDetails",
    "cardIsExisted",
    "getMaxCardID"
  ]
  let backendFunctions = {};
  listDBFunctions.forEach((funcName) =>{
    backendFunctions[funcName] = (...args) => {
      localStorage.setItem('list_call', JSON.stringify({
        'funcName': funcName,
        'args': args,
      }));
      console.log(funcName, ...args);
      return ipcRenderer.invoke(funcName, ...args)
    };
  })
  otherDBFunctions.forEach((funcName)=>{
    backendFunctions[funcName] = (...args) => ipcRenderer.invoke(funcName, ...args);
  })
  contextBridge.exposeInMainWorld('db', backendFunctions);
})();