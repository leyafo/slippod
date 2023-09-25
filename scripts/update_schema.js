
const config = require("../main/config.js");
const db = require("../main/db.js");
(function(){
    const appPath = process.cwd();
    console.log(appPath);
    const dbPath = config.readDBPathConfig()
    const extPath = config.getExtensionPath(appPath);
    const dictPath = config.getExtensionPath(appPath);
    db.initialize(extPath, dictPath, dbPath);
    db.updateSchema();
}());
