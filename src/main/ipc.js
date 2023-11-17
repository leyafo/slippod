const {dialog, shell, clipboard, ipcMain, app, BrowserWindow } = require("electron");
const windowMgr = require('./window')
const createMarkdownRender = require("./md_render.js").createMarkdownRender  
const config = require('./config.js');
const licenseModule = require("./l.js");
const db = require("./db.js");
const path = require('path')
const fs = require('fs')
const dbSchema = require('./schema.js');

const licenseKey = 'license'
let globalLicense = {}

function acquireLicense(){
    let tokenStr = db.getConfig(licenseKey);
    if(tokenStr == ''){
        return {}
    }
    let licenseObj = {}
    try{
        licenseObj =  JSON.parse(tokenStr)
    }catch(error){
        console.error(error)
        return {}
    }
    return licenseObj
}

ipcMain.handle("duplicateWindow", async function(event, ...args)  {
    let newMainWindow = windowMgr.duplicateMainWindow();
    newMainWindow.show();
});

ipcMain.handle("displayCardCounts", async function(event){
    const window = BrowserWindow.getFocusedWindow()
    window.webContents.send("displayCardCounts");
});

let markdownRender = createMarkdownRender()
ipcMain.handle("markdownRender", async function(event, rawText){
    return markdownRender(rawText)
});

ipcMain.handle("copyTextToClipboard", async function(event, text){
    return clipboard.writeText(text);
});

ipcMain.handle("pasteTextFromClipboard", async function(event){
    return clipboard.readText();
});

ipcMain.handle("openExternalURL", async function(event, url){
    return shell.openExternal(url);
});

ipcMain.handle("showRegisterWindow", async function(event){
    windowMgr.createRegisterWindow() 
});

['register', 'register_trial'].forEach(function(funcName)  {
    ipcMain.handle(funcName, async function(event, ...args)  {
        let result = licenseModule[funcName](...args);
        result.then(function(response){
            if(response.statusCode == 200){
                db.setConfig(licenseKey, response.body)
            }
        })
        return result
    });
});

ipcMain.handle("getLicense", async function(event){
    globalLicense = acquireLicense()//refresh global license
    let licenseObj = globalLicense
    let isValid = await licenseModule.checkLicense(licenseObj)
    licenseObj.isValid = isValid
    return licenseObj
})

ipcMain.handle("reloadAll", async function(event, ...args)  {
    globalLicense = acquireLicense()
    return windowMgr.reloadAllMainWindow()
});

ipcMain.handle("reloadCurrentWindow", async function(event, ...args){
    BrowserWindow.getFocusedWindow().reload(); 
});

ipcMain.handle("openSetting", async function(event, ...args){
    windowMgr.createSettingsWindow().show()
})

ipcMain.handle("filePicker", async function(event, ...args)  {
    let settingsWindow = windowMgr.getSettingsWindow()
    let mainWindow = windowMgr.getMainWindow();
    const dbPath = dialog.showOpenDialogSync({
        browserWindow: settingsWindow,
        properties: ["openFile"],
        filters: [{ name: "slippod", extensions: ["db"] }],
    });
    if (dbPath != undefined) {
        try {
            db.reloadDB(dbPath[0]);
            config.saveDBPathToConfigFile(configFilePath, dbPath[0]);
            mainWindow.reload();
        } catch (err) {
            dialog.showMessageBoxSync(mainWindow, { message: err.message });
        }
    }
    return dbPath;
});

ipcMain.handle("showCardDetail", async function(event, cardID)  {
    windowMgr.createDetailWindow(cardID);
})

ipcMain.handle("getDBPath", async function(event, ...args)  {
    return config.readDBPathFromConfigFile(configFilePath);
});


const configFilePath = path.join(config.getUserDataPath(), "slippod.config")
async function registerDBFunctions(){
    const appPath = app.getAppPath();
    const extPath = config.getExtensionPath(appPath);
    const dictPath = config.getDictPath(appPath);
    const dbPath = config.readDBPathFromConfigFile(configFilePath);
    //如果数据库路径不存在就初始化它
    if (dbPath == "" || !fs.existsSync(dbPath)) {
        const defaultDBPath = path.join(config.getUserDataPath(), "slippod.db");
        config.saveDBPathToConfigFile(configFilePath, defaultDBPath);
        db.connect(extPath, dictPath, defaultDBPath);
        db.loadSchema(dbSchema.schema);
        require("./db_init.js").insertSampleData();
    } else {
        db.connect(extPath, dictPath, dbPath);
    }

    const functionNames = Object.keys(db);
    const needCheckFunctions = new Set([
        "moveCardToTrash",
        "updateCardEntryByID",
        "createNewCard",
        "renameTag",
        "updateDraft",
        "removeCardFromTrash",
        "removeCardPermanently",
        "restoreCard",
        "setConfig",
    ])
    globalLicense = acquireLicense()
    const lastCreatedCard = db.getCards(0, 1)
    let lastCreatedTime = Date.now()
    if(lastCreatedCard.length != 0){
        lastCreatedTime = new Date(lastCreatedCard[0].created_at * 1000);
    }
    functionNames.forEach(function(funcName)  {
        ipcMain.handle(funcName, async function(event, ...args)  {
            if (needCheckFunctions.has(funcName)){
                let result = await licenseModule.checkLicense(globalLicense, lastCreatedTime)
                if (result == false){
                    return {"error":"license is not valid"}
                }
            }
            return db[funcName](...args);
        });
    });
}

module.exports = {
    registerDBFunctions,
}