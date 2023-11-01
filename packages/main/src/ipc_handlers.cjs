const { BrowserWindow, ipcMain, dialog, app } = require('electron');
const db = require('./db.cjs');
const config = require('./config.cjs');
const fs = require("fs");
const path = require('path');
const licenseModule = require('./l.cjs');
const dbSchema = require('./schema.cjs');

const configFilePath = path.join(config.getUserDataPath(), "slippod.config")
console.log(configFilePath)
module.exports = {
    registerWindowHandlers: function (windowMgr) {
        ipcMain.handle("reloadAll", async (event, ...args) => {
            BrowserWindow.getFocusedWindow().reload(); 
        });

        ipcMain.handle("filePicker", async (event, ...args) => {
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

        ipcMain.handle("showCardDetail", async (event, cardID) => {
            windowMgr.createDetailWindow(cardID);
        })

        ipcMain.handle("getDBPath", async (event, ...args) => {
            return config.readDBPathFromConfigFile(configFilePath);
        });

    },

    registerDBFunctions: function(){
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
            require("./db_init.cjs").insertSampleData();
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
            console.error(error)
        }
        const lastCreatedCard = db.getCards(0, 1)
        let lastCreatedTime = Date.now()
        if(lastCreatedTime.length > 0){
            lastCreatedTime = new Date(lastCreatedCard.created_at * 1000);
        }
        functionNames.forEach((funcName) => {
            ipcMain.handle(funcName, async (event, ...args) => {
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