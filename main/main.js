// main.js
const {
  dialog,
  globalShortcut,
  ipcMain,
  app,
  BrowserWindow,
  Menu,
  webFrame,
} = require("electron");
const path = require("path");
const fs = require("fs");
const config = require("./config.js");
const db = require("./db.js");
const editorUpdating = require("./editor_update.js")

function getResourceURL(...pathes) {
  if (process.env.NODE_ENV === "development") {
    const urlPath = new URL(
      path.join(...pathes),
      "http://localhost:5173"
    ).toString();
    return urlPath;
  }

  const filePath = path.join(app.getAppPath(), "dist", ...pathes);
  return `file://${filePath}`;
}

let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const url = getResourceURL("resource", "app", "index.html");
  mainWindow.loadURL(url);
  if (process.env.NODE_ENV == "development") {
    const contextMenu = require("electron-context-menu");
    contextMenu({
      prepend: (defaultActions, params, browserWindow) => [
        { type: "separator" },
      ],
    });
  }

  globalShortcut.register("CommandOrControl+R", function () {
    console.log("CommandOrControl+R is pressed");
    mainWindow.reload();
  });
  // mainWindow.setMenuBarVisibility(false);
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  createMenu();

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

let settingsWindow = null;
function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "settings_preload.js"),
    },
    parent: mainWindow,
    modal: true,
    show: true,
  });

  const url = getResourceURL("resource", "settings", "index.html");
  settingsWindow.loadURL(url);
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
  settingsWindow.setMenuBarVisibility(false);
}

function createMenu() {
  const template = [
    {
      label: "Application",
      submenu: [
        {
          label: "Settings",
          click: () => {
            if (settingsWindow === null) {
              createSettingsWindow();
            } else {
              settingsWindow.show();
            }
          },
        },
        { type: "separator" },
        { role: "quit" }, // Add a Quit option if desired
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

//ipc event handlers
ipcMain.handle("reloadAll", async (event, ...args) => {
  mainWindow.reload();
});

ipcMain.handle("uploadCardEditing", async (event, id, entry) => {
    editorUpdating.uploadCardEditing(id, entry);
});

ipcMain.handle("filePicker", async (event, ...args) => {
  settingsWindow.hide();
  const dbPath = dialog.showOpenDialogSync({
    browserWindow: mainWindow,
    properties: ["openFile"],
    filters: [{ name: "slippod", extensions: ["db"] }],
  });
  settingsWindow.show();
  if (dbPath != undefined) {
    try {
      db.reloadDB(dbPath[0]);
      config.writeDBPathConfig(dbPath[0]);
      mainWindow.reload();
    } catch (err) {
      console.error(err);
      dialog.showMessageBoxSync(mainWindow, { message: err.message });
    }
  }
  return dbPath;
});

ipcMain.handle("getDBPath", async (event, ...args) => {
  return config.readDBPathConfig();
});

function registerDBFunctions(functionNames) {
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
    db.createSchema();
    require("./db_init.js").insertSampleData();
  } else {
    db.initialize(extPath, dictPath, dbPath);
  }
}
registerDBFunctions(Object.keys(db));
