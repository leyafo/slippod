// main.js
const {
  app,
  BrowserWindow,
} = require("electron");
const WindowManager = require('./window_manager');
const ipcHandler = require("./ipc_handlers")
const windowManager = new WindowManager();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    let mainWindow = windowManager.createMainWindow();
    windowManager.createMenu();
    ipcHandler.registerDBFunctions();
    ipcHandler.registerWindowHandlers(mainWindow);

    app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

