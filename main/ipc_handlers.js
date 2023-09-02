const { ipcMain, dialog, app } = require('electron');
const editorUpdating = require('./editor_update.js');
const db = require('./db.js');
const config = require('./config.js');
const fs = require("fs");

module.exports = {
    registerWindowHandlers: function (mainWindow) {
        ipcMain.handle("reloadAll", async (event, ...args) => {
            mainWindow.reload();
        });

        ipcMain.handle("uploadCardEditing", async (event, id, entry) => {
            editorUpdating.uploadCardEditing(id, entry);
        });

        ipcMain.handle("filePicker", async (event, ...args) => {
            const dbPath = dialog.showOpenDialogSync({
                browserWindow: mainWindow,
                properties: ["openFile"],
                filters: [{ name: "slippod", extensions: ["db"] }],
            });
            if (dbPath != undefined) {
                try {
                    db.reloadDB(dbPath[0]);
                    config.writeDBPathConfig(dbPath[0]);
                    mainWindow.reload();
                } catch (err) {
                    dialog.showMessageBoxSync(mainWindow, { message: err.message });
                }
            }
            return dbPath;
        });

        ipcMain.handle("getDBPath", async (event, ...args) => {
            return config.readDBPathConfig();
        });
    },

    registerDBFunctions: function(){
        const functionNames = Object.keys(db);
        functionNames.forEach((funcName) => {
            ipcMain.handle(funcName, async (event, ...args) => {
                return db[funcName](...args);
            });
        });
        const appPath = app.getAppPath();
        const extPath = config.getExtensionPath(appPath);
        const dictPath = config.getExtensionPath(appPath);
        let dbPath = config.readDBPathConfig();
        if (dbPath == "" || !fs.existsSync(dbPath)) {
            dbPath = path.join(config.getAppDataPath(), "slippod.db");
            config.writeDBPathConfig(dbPath);
            db.initialize(extPath, dictPath, dbPath);
            db.updateSchema();
            require("./db_init.js").insertSampleData();
        } else {
            db.initialize(extPath, dictPath, dbPath);
        }
    }
};