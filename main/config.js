const fs = require("fs");
const path = require('path');

function getAppDataPath() {
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
    const os = require('os');
    const path = require("path")
    if(os.platform == "win32"){
        return path.join(appDir, "libsimple", "libsimple.dll") 
    }else{
        return path.join(appDir, "libsimple", "libsimple") 
    }
}

function getDictPath(appDir){
    return path.join(appDir, "libsimple", "dict")
}

function readDBPathConfig(){
    const configFilePath = path.join(getAppDataPath(), "slippod.config");
    if(!fs.existsSync(configFilePath)){
        return ""
    }
    const dbPath = fs.readFileSync(configFilePath).toString();
    return dbPath;
}

function writeDBPathConfig(dbPath){
    const configFilePath = path.join(getAppDataPath(), "slippod.config");
    if (!fs.existsSync(getAppDataPath())){
        fs.mkdirSync(getAppDataPath())
    }
    fs.writeFileSync(configFilePath, dbPath)
}

module.exports = {
    getAppDataPath,
    getDictPath,
    getExtensionPath,
    readDBPathConfig,
    writeDBPathConfig,
}