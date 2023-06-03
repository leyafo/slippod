// main.js

// Modules to control application life and create native browser window
const {globalShortcut, ipcMain, app, BrowserWindow } = require('electron')
const path = require('path')
const db = require('./db.js')

// const remote = require('remote')
// const Menu = remote.require('menu')
// const MenuItem = remote.require('menu-item')
const contextMenu = require('electron-context-menu');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  const url = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5173' // The URL of the Vite dev server.
  : `file://${path.join(app.getAppPath(),"front_dist/index.html")}`; // The path to your built index.html file.
  mainWindow.loadURL(url);

  // Open the DevTools.
  if (process.env.NODE_ENV == 'development'){
    mainWindow.webContents.openDevTools();
  }

  mainWindow.setMenuBarVisibility(false);
  contextMenu({
    prepend: (defaultActions, params, browserWindow) => [
      // new MenuItem({
      //   label: "Inspect Element",
      //   click: () => {
      //     browserWindow.webContents.inspectElement(params.x, params.y);
      //   },
      // }),
      { type: "separator" },
    ],
  });
  globalShortcut.register('CommandOrControl+R', function() {
		console.log('CommandOrControl+R is pressed');
		mainWindow.reload();
	})
  ipcMain.handle("reloadAll", async(event, ...args)=>{
    mainWindow.reload();
  })
}

function registerDBFunctions(functionNames) {
  functionNames.forEach((funcName) => {
    ipcMain.handle(funcName, async (event, ...args) => {
      return db[funcName](...args);
    });
  });
  const appPath = app.getAppPath();
  console.log(appPath);
  const {getExtensionPath} = require("./schema.js")

  const libPath = getExtensionPath(path.join(appPath, "libsimple"));
  const dictPath = path.join(appPath, "libsimple", "dict")
  const dbPath = path.join(appPath, "slippod.db");

  db.initialize(libPath, dictPath, dbPath);
}
registerDBFunctions(Object.keys(db));

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})