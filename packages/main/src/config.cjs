const fs = require("fs");
const path = require('path');
const os = require("os");
const {app} = require('electron');

function getUserDataPath() {
    if (import.meta.env.DEV){
        return app.getAppPath();
    } 
    switch (process.platform) {
    case "darwin": {
            return path.join(process.env.HOME, "Library", "Application Support", "slippod");
        }
    case "win32": {
            return path.join(process.env.APPDATA, "slippod");
        }
    case "linux": {
            return path.join(process.env.HOME, ".slippod");
        }
    default: {
            console.log("Unsupported platform!");
            process.exit(1);
        }
    }
}

function getExtensionPath(appDir){
    //get the same resource dir if is in production
    if (!import.meta.env.DEV) {
        appDir = path.dirname(appDir);
    }
    if(os.platform == "win32"){
        return path.join(appDir, "libsimple", "libsimple.dll") 
    }else{
        return path.join(appDir, "libsimple", "libsimple") 
    }
}

function getDictPath(appDir){
    if (!import.meta.env.DEV) {
        appDir = path.dirname(appDir);
    }
    return path.join(appDir, "libsimple", "dict")
}

function readDBPathFromConfigFile(configFilePath){
    if(!fs.existsSync(configFilePath)){
        return ""
    }
    const dbPath = fs.readFileSync(configFilePath).toString();
    return dbPath;
}
function saveDBPathToConfigFile(configFilePath, dbPath){
    fs.writeFileSync(configFilePath, dbPath)
}

module.exports = {
    readDBPathFromConfigFile,
    saveDBPathToConfigFile,
    getUserDataPath,
    getDictPath,
    getExtensionPath,
}