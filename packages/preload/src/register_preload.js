const { contextBridge, ipcRenderer } = require('electron')

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
    "showRegisterWindow"
]

modulePreload("license", licenseFuncNames);