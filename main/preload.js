// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('utils', {
    reloadAll: (...args) => ipcRenderer.invoke("reloadAll", ...args),
    uploadCardEditing: (id, entry) => ipcRenderer.invoke("uploadCardEditing", id, entry),
    markdownRender: (rawText) => ipcRenderer.invoke("markdownRender", rawText),
});

contextBridge.exposeInMainWorld('pages', {
    showCardDetail: function(cardID) {
        return ipcRenderer.invoke("showCardDetail", cardID)
    },
    duplicateWindow: function(){
        return ipcRenderer.invoke("duplicateWindow");
    }
});

(function () {
    const paginatedDFFunc = [
        "getCards",
        "getCardsByTag",
        "getTrashCards",
        "getNoTagCards",
        "getCardsByMiddleID",

    ]
    const fullsetDBFunc = [
        "getLinkAtRegex",
        "getTagRegex",
        "removeCardFromTrash",
        "removeCardPermanently",
        "restoreCard",
        "searchCards",
        "createNewCard",
        "getAllTags",
        "getCardByID",
        "moveCardToTrash",
        "updateCardEntryByID",
        "getCardDetails",
        "cardIsExisted",
        "getMaxCardID",
        "getAllCards",
        "searchCardsWithStyle",
        "getCardSearchSuggestions",
    ]
    let backendFunctions = {};
    paginatedDFFunc.forEach((funcName) => {
        backendFunctions[funcName] = (...args) => {
            localStorage.setItem('list_call', JSON.stringify({
                'funcName': funcName,
                'args': args,
            }));
            console.log(funcName, ...args);
            return ipcRenderer.invoke(funcName, ...args)
        };
    })
    fullsetDBFunc.forEach((funcName) => {
        backendFunctions[funcName] = (...args) => ipcRenderer.invoke(funcName, ...args);
    })
    contextBridge.exposeInMainWorld('db', backendFunctions);
})();