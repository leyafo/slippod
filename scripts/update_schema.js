
const config = require("./packages/main/config.js");
const db = require("./packages/main/db.js");
const dbSchema = require('./packages/main/schema.js')
(function(){
    const appPath = process.cwd();
    console.log(appPath);
    const dbPath = config.readDBPathConfig()
    const extPath = config.getExtensionPath(appPath);
    const dictPath = config.getExtensionPath(appPath);
    db.connect(extPath, dictPath, dbPath);
    db.loadSchema(dbSchema.schema);
}());
