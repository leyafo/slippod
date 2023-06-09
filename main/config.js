

const fs = require("fs");
const path = require('path');
const appDir = path.join(path.dirname(require.main.filename), "..");
const configFilePath = path.join(appDir, "slippod.config");

function readDBPathConfig(){
    const dbPath = fs.readFileSync(configFilePath).toString();
    return dbPath;
}
function writeDBPathConfig(dbPath){
    fs.writeFileSync(configFilePath, dbPath)
}

module.exports = {
    readDBPathConfig,
    writeDBPathConfig,
}