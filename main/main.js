// main.js
const {clipboard, globalShortcut,ipcMain, app, Menu, BrowserWindow } = require("electron");
const WindowManager = require('./window_manager');
const ipcHandler = require("./ipc_handlers");
const {menuTemplate} = require("./menu");
const createMarkdownRender = require("./md_render").createMarkdownRender  

const windowMgr = new WindowManager();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let mainWindow = null;
app.whenReady().then(() => {
    mainWindow = windowMgr.createMainWindow();
    const menu = Menu.buildFromTemplate(menuTemplate(windowMgr));
    Menu.setApplicationMenu(menu);

    ipcHandler.registerDBFunctions();
    ipcHandler.registerWindowHandlers(windowMgr);

    app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = windowMgr.createMainWindow();
        }
    });

    globalShortcut.register("CommandOrControl+R", () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if(focusedWindow != null){
            focusedWindow.reload(); 
        }
    });
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("duplicateWindow", async (event, ...args) => {
    const windowMgr = new WindowManager();
    let newMainWindow = windowMgr.createMainWindow();
    newMainWindow.show();
});

ipcMain.handle("displayCardCounts", async(event)=>{
    const window = BrowserWindow.getFocusedWindow()
    window.webContents.send("displayCardCounts");
})


let markdownRender = createMarkdownRender()
ipcMain.handle("markdownRender", async(event, rawText)=>{
    return markdownRender(rawText)
})

ipcMain.handle("copyTextToClipboard", async function(event, text){
    return clipboard.writeText(text);
});

ipcMain.handle("pasteTextFromClipboard", async function(event){
    return clipboard.readText();
})

ipcMain.handle("platform", async function(event){
    return process.platform
})