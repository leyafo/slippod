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

// 期望去刷所有的main窗口，但是当前没有这个接口，需要添加
contextBridge.exposeInMainWorld('pages', {
    reloadAll: function(...args) {
        return ipcRenderer.invoke("reloadAll", ...args);
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