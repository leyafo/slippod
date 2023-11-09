const { BrowserWindow, ipcMain, dialog, app } = require('electron');
const db = require('./db.js');
const config = require('./config.js');
const fs = require("fs");
const path = require('path');
const licenseModule = require('./l.js');
const dbSchema = require('./schema.js');

const configFilePath = path.join(config.getUserDataPath(), "slippod.config")
console.log(configFilePath)
module.exports = {
    registerWindowHandlers: function (windowMgr) {
        ipcMain.handle("reloadAll", async function(event, ...args)  {
            BrowserWindow.getFocusedWindow().reload(); 
        });

        ipcMain.handle("filePicker", async function(event, ...args)  {
            let settingsWindow = windowMgr.getSettingsWindow()
            settingsWindow.hide();
            let mainWindow = windowMgr.getMainWindow();
            const dbPath = dialog.showOpenDialogSync({
                browserWindow: mainWindow,
                properties: ["openFile"],
                filters: [{ name: "slippod", extensions: ["db"] }],
            });
            settingsWindow.show();
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

    },

    registerDBFunctions: function(){
        const appPath = app.getAppPath();
        console.log(appPath);
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
        let license = {}
        try{
            license = JSON.parse(db.getConfig("license"))
        }catch(error){
            license = {}
            console.error(error)
        }
        const lastCreatedCard = db.getCards(0, 1)
        let lastCreatedTime = Date.now()
        functionNames.forEach(function(funcName)  {
            ipcMain.handle(funcName, async function(event, ...args)  {
                if (needCheckFunctions.has(funcName)){
                    let result = await licenseModule.checkLicense(license, lastCreatedTime)
                    if (result == false){
                        return {"error":"license is not valid"}
                    }
                }
                return db[funcName](...args);
            });
        });
    }
};