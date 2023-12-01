const fs = require("fs");
const path = require('path');
const os = require("os");
const {app} = require('electron');
const env = require('./env.js')

function getUserDataPath() {
    if (env.isDev()){
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

function getIconPath() {
    if (env.isDev()) {
        return ""; 
    }

    const appPath = path.dirname(app.getAppPath());
    let iconPath = path.join(appPath, 'icons', 'icon.png');
    if(!fs.existsSync(iconPath)){
        iconPath = path.join(appPath, 'icons', 'icon_white.png');
    }

    switch (process.platform) {
        case "win32":
            iconPath = path.join(appPath, 'icons', 'icon.ico');
            if(!fs.existsSync(iconPath)){
                iconPath = path.join(appPath, 'icons', 'icon_white.ico');
            }
            break;
    }

    return iconPath;
}

function getExtensionPath(appDir){
    //get the same resource dir if is in production
    if (!env.isDev()) {
        appDir = path.dirname(appDir);
    }
    if(os.platform == "win32"){
        return path.join(appDir, "libsimple", "libsimple.dll") 
    }else{
        return path.join(appDir, "libsimple", "libsimple") 
    }
}

function getDictPath(appDir){
    if (!env.isDev()) {
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
    getIconPath,
}