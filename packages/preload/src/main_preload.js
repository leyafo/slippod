// preload.js
import {contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('env', {
    platform: process.platform,
    "isDev": function(){
        return import.meta.env.DEV
    },
    "app":function(){
        return import.meta.env
    }
})
contextBridge.exposeInMainWorld('utils', {
    uploadCardEditing: (id, entry) => ipcRenderer.invoke("uploadCardEditing", id, entry),
    markdownRender: (rawText) => ipcRenderer.invoke("markdownRender", rawText),
    copyTextToClipboard:function(text){
        return ipcRenderer.invoke("copyTextToClipboard", text);
    },
    pasteTextFromClipboard:function(){
        return ipcRenderer.invoke("pasteTextFromClipboard");
    },
    platform: function(){
        return ipcRenderer.invoke("platform");
    },
    openExternalURL: function (url) {
        return ipcRenderer.invoke('openExternalURL', url)
    },
    register_trial: function(){
        return ipcRenderer.invoke('register_trial')
    }
});


contextBridge.exposeInMainWorld('pages', {
    reloadAll: (...args) => ipcRenderer.invoke("reloadAll", ...args),
    showCardDetail: function(cardID) {
        return ipcRenderer.invoke("showCardDetail", cardID)
    },
    duplicateWindow: function(){
        return ipcRenderer.invoke("duplicateWindow");
    }
});

//black magic
contextBridge.exposeInMainWorld('backendBridge', {
    displayCardCounts: (callback) => ipcRenderer.on("displayCardCounts", (callback)),
    displayCardDetail: (callback) => ipcRenderer.on("displayCardDetail", (callback))
});

function modulePreload(moduleName, functionArray, callback){
    let moduleFuncs = {}
    functionArray.forEach((funcName) => {
        moduleFuncs[funcName] = (...args) => {
            if(callback != undefined){
                callback(funcName, args)
            }
            return ipcRenderer.invoke(funcName, ...args)
        };
    })
    contextBridge.exposeInMainWorld(moduleName, moduleFuncs);
}
const licenseFuncNames = [
    "register",
    "register_trial",
    "checkTrialLicense",
    "getLicense",
    "checkLicense",
]
modulePreload("license", licenseFuncNames);

(function () {
    const paginatedDFFunc = [
        "getCards",
        "getCardsByTag",
        "getTrashCards",
        "getNoTagCards",
        "getCardsByMiddleID",
    ];
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
        "countDifferentCards",
        "countTaggedCards",
        "renameTag",
        "updateDraft",
        "getDraft",
    ];
    const needRecount = new Set([
        "removeCardFromTrash",
        "removeCardPermanently",
        "moveCardToTrash",
        "createNewCard",
    ]);

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
        backendFunctions[funcName] = (...args) => {
            let ipcResult = ipcRenderer.invoke(funcName, ...args);
            if (needRecount.has(funcName)){
                setTimeout(function(){
                    //starting spell the India black magic
                    ipcRenderer.invoke('displayCardCounts');
                }, 200);
            }
            return ipcResult
        }
    })
    contextBridge.exposeInMainWorld('db', backendFunctions);
})();