// main.js
const {app, Menu, BrowserWindow } = require("electron");
const ipcHandler = require("./ipc.js");
const {menuTemplate} = require("./menu.js");
const windowMgr = require('./window.js')

/***********diable gpu *****/
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.disableHardwareAcceleration()
/***************************/

ipcHandler.registerDBFunctions();
Menu.setApplicationMenu(null)
app.whenReady().then(async function()  {
    windowMgr.createMainWindow();
    const menu = Menu.buildFromTemplate(menuTemplate());
    Menu.setApplicationMenu(menu);
    app.on("activate", function()  {
        if (BrowserWindow.getAllWindows().length === 0) {
            windowMgr.createMainWindow();
        }
    });

    app.on("window-all-closed", function()  {
        // Quit when all windows are closed, except on macOS. There, it's common
        // for applications and their menu bar to stay active until the user quits
        // explicitly with Cmd + Q.
        if (process.platform !== "darwin") app.quit();
    });
});

