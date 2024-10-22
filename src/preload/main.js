// preload.js
const {contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('env', {
    platform: process.platform,
    "isDev": function(){
        return process.env.NODE_ENV == 'dev'
    },
    "nodeEnv": function(){
        if(process.env.NODE_ENV == undefined){
            return 'production'
        }
        return process.env.NODE_ENV
    }

})
contextBridge.exposeInMainWorld('utils', {
    uploadCardEditing: function(id, entry)  {
        return ipcRenderer.invoke("uploadCardEditing", id, entry);
    },
    markdownRender: function(rawText) {return ipcRenderer.invoke("markdownRender", rawText);},
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
});


contextBridge.exposeInMainWorld('pages', {
    reloadAll: function(...args) {
        return ipcRenderer.invoke("reloadAll", ...args);
    },
    showCardDetail: function(cardID) {
        return ipcRenderer.invoke("showCardDetail", cardID)
    },
    duplicateWindow: function(){
        return ipcRenderer.invoke("duplicateWindow");
    },
    reloadCurrentWindow: function(...args){
        return ipcRenderer.invoke("reloadCurrentWindow", ...args);
    },
    openSetting: function(...args){
        return ipcRenderer.invoke("openSetting", ...args)
    }
});

//black magic
contextBridge.exposeInMainWorld('backendBridge', {
    displayCardCounts: function(callback) {
        return ipcRenderer.on("displayCardCounts", (callback));
    },
    displayCardDetail: function(callback) {
        return ipcRenderer.on("displayCardDetail", (callback));
    }, 
    startSearch: function(callback){
        return ipcRenderer.on("startSearch", (callback));
    },
    openNewCard: function(callback){
        return ipcRenderer.on("openNewCard", (callback));
    }
});


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
    paginatedDFFunc.forEach(function(funcName)  {
        backendFunctions[funcName] = function(...args)  {
            localStorage.setItem('list_call', JSON.stringify({
                'funcName': funcName,
                'args': args,
            }));
            // console.log(funcName, ...args);
            return ipcRenderer.invoke(funcName, ...args)
        };
    })
    fullsetDBFunc.forEach(function(funcName)  {
        backendFunctions[funcName] = function(...args) {
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
