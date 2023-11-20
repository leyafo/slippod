// main.js
const {app, Menu, BrowserWindow } = require("electron");
const ipcHandler = require("./ipc.js");
const menu = require("./menu");
const windowMgr = require('./window.js')
const conf = require('./config.js');

/***********diable gpu *****/
//app.commandLine.appendSwitch('ignore-gpu-blacklist');
//app.commandLine.appendSwitch('disable-gpu');
//app.commandLine.appendSwitch('disable-gpu-compositing');
//app.disableHardwareAcceleration()
/***************************/

ipcHandler.registerDBFunctions();
Menu.setApplicationMenu(null)
let mainWindow = null;
app.whenReady().then(async function() {
    mainWindow = windowMgr.createMainWindow();
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu.menuTemplate()));
    app.on("activate", function()  {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = windowMgr.createMainWindow();
        }
    });

    app.on("window-all-closed", function()  {
        // Quit when all windows are closed, except on macOS. There, it's common
        // for applications and their menu bar to stay active until the user quits
        // explicitly with Cmd + Q.
        if (process.platform !== "darwin") app.quit();
    });
});

app.setAboutPanelOptions({
    applicationName: "Slippod",
    applicationVersion: app.getVersion(),
    version: app.getVersion(),
    copyright: "Copyright © ANYWHERE ARC LTD",
    authors: "ANYWHERE ARC LTD",
    website: "https://www.slippod.com",
    iconPath:  conf.getIconPath(),
});