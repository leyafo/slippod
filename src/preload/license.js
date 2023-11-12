const { contextBridge, ipcRenderer } = require('electron')

function modulePreload(moduleName, functionArray, callback){
    let moduleFuncs = {}
    functionArray.forEach(function(funcName)  {
        moduleFuncs[funcName] = function(...args)  {
            if(callback != undefined){
                callback(funcName, args)
            }
            return ipcRenderer.invoke(funcName, ...args)
        };
    })
    contextBridge.exposeInMainWorld(moduleName, moduleFuncs);
}

contextBridge.exposeInMainWorld('pages', {
    reloadAll: function(...args) {
        return ipcRenderer.invoke("reloadAll", ...args);
    },
    reloadCurrentWindow: function(...args){
        return ipcRenderer.invoke("reloadCurrentWindow", ...args);
    }
});

const licenseFuncNames = [
    "register",
    "register_trial",
    "checkTrialLicense",
    "getLicense",
    "checkLicense",
    "showRegisterWindow"
]

modulePreload("license", licenseFuncNames);