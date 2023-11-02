// main.js
const {shell, clipboard, ipcMain, app, Menu, BrowserWindow } = require("electron");
const WindowManager = require("./window_manager.cjs");
const ipcHandler = require("./ipc_handlers.cjs");
const {menuTemplate} = require("./menu.cjs");
const license = require("./l.cjs");
const db = require("./db.cjs");
const createMarkdownRender = require("./md_render.cjs").createMarkdownRender  

const windowMgr = new WindowManager();
ipcHandler.registerDBFunctions();
ipcHandler.registerWindowHandlers(windowMgr);

let mainWindow = null;
app.whenReady().then(async() => {
    mainWindow = windowMgr.createMainWindow();
    const menu = Menu.buildFromTemplate(menuTemplate(windowMgr));
    Menu.setApplicationMenu(menu);
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = windowMgr.createMainWindow();
        }
    });

    app.on("window-all-closed", () => {
        // Quit when all windows are closed, except on macOS. There, it's common
        // for applications and their menu bar to stay active until the user quits
        // explicitly with Cmd + Q.
        if (process.platform !== "darwin") app.quit();
    });
});


ipcMain.handle("duplicateWindow", async (event, ...args) => {
    const windowMgr = new WindowManager();
    let newMainWindow = windowMgr.createMainWindow();
    newMainWindow.show();
});

ipcMain.handle("displayCardCounts", async(event)=>{
    const window = BrowserWindow.getFocusedWindow()
    window.webContents.send("displayCardCounts");
});

let markdownRender = createMarkdownRender()
ipcMain.handle("markdownRender", async(event, rawText)=>{
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

Object.keys(license).forEach((funcName) => {
    ipcMain.handle(funcName, async (event, ...args) => {
        let result = license[funcName](...args);
        if(funcName == 'register' || funcName == 'register_trial'){
            result.then(function(response){
                if(response.statusCode == 200){
                    db.setConfig('license', response.body)
                }
            })
        }
        return result
    });
});

ipcMain.handle("getLicense", async function(event){
    let licenseToken = db.getConfig("license");
    if(licenseToken == ''){
        return {}
    }
    return JSON.parse(licenseToken)
})