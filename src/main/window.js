const { app, BrowserWindow } = require('electron');
const path = require('path');
const db = require('./db.js');
const env = require('./env.js');
const conf = require("./config.js")

let mainWindow = null;
let settingsWindow = null;
let detailWindow = null; 
let registerWindow = null;
let mainWindowArray = [];

function createWindow(windowConfig, entryPointHTML) {
    let newWindow = new BrowserWindow(windowConfig);
    loadEntryPoint(newWindow, entryPointHTML);

    newWindow.once("ready-to-show", () => {
        newWindow.show();
    });

    return newWindow;
}

function loadEntryPoint(window, entryPointHTML) {
    const urlPath = env.getResourceURL(entryPointHTML);
    if (env.isDev()) {
        window.loadURL(urlPath);
    } else {
        window.loadFile(urlPath);
    }
}

function getPreloadPath(fileName) {
    return path.join(__dirname, `../preload/${fileName}`);
}


function createMainWindow() {
    if (mainWindow != null){
        return
    }
    let titleBarStyle = "default"
    if (process.platform == "darwin") {
        titleBarStyle = "hidden"
    }
    const windowConfig = {
        width: 800,
        height: 800,
        minWidth: 400,
        minHeight: 400,
        titleBarStyle: titleBarStyle,
        icon: conf.getIconPath(),
        webPreferences: {
            preload: getPreloadPath("main.js"),
            scrollBounce: true,
            nodeIntegration: true,
        },
    };

    mainWindow = createWindow(windowConfig, 'index.html');
    setupDevTools(mainWindow);
    if(env.isDev()){
        // mainWindow.webContents.openDevTools()
    }

    mainWindow.on("closed", function() {
        mainWindow = null;
    });
    mainWindowArray.push(mainWindow);

    return mainWindow;
}

function duplicateMainWindow(){
    let activeWindow = BrowserWindow.getFocusedWindow();
    let x = 0;
    let y = 0;

    if (activeWindow) {
        x = activeWindow.getBounds().x;
        y = activeWindow.getBounds().y;
    }

    let titleBarStyle = "default"
    if (process.platform == "darwin") {
        titleBarStyle = "hidden"
    }
    const windowConfig = {
        x: x + 50,
        y: y + 50,
        width: 800,
        height: 800,
        minWidth: 400,
        minHeight: 300,
        titleBarStyle: titleBarStyle,
        icon: conf.getIconPath(),
        webPreferences: {
            preload: getPreloadPath("main.js"),
            scrollBounce: true,
            nodeIntegration: true,
        },
    };

    let newMainWindow = createWindow(windowConfig, 'index.html');
    setupDevTools(newMainWindow);

    newMainWindow.on("closed", function() {
        newMainWindow = null;
    });

    mainWindowArray.push(newMainWindow);
    return newMainWindow;
}

function reloadAllMainWindow(){
    for(let window of BrowserWindow.getAllWindows()){
        //copy from electron
        if (!window.isDestroyed() && window.webContents && !window.webContents.isDestroyed()) {
            window.reload()
        }
    }
}

function createSettingsWindow() {
    if (!mainWindow) {
        throw new Error("Main window must be initialized before settings window");
    }
    if (settingsWindow) {
        settingsWindow.show();
        return settingsWindow;
    }

    const windowConfig = {
        width: 520,
        height: 300,
        icon: conf.getIconPath(),
        show: false,
        webPreferences: {
            preload: getPreloadPath("setting.js"),
            scrollBounce: true,
            nodeIntegration: true,
        },
    };

    settingsWindow = createWindow(windowConfig, 'setting.html');
    settingsWindow.setMenuBarVisibility(false);

    settingsWindow.on("closed", () => {
        settingsWindow = null;
    });

    return settingsWindow;
}

function createDetailWindow(cardID) {
    let activeWindow = BrowserWindow.getFocusedWindow();
    let x = 0;
    let y = 0;

    if (activeWindow) {
        x = activeWindow.getBounds().x;
        y = activeWindow.getBounds().y;
    }

    let titleBarStyle = "default"
    if (process.platform == "darwin") {
        titleBarStyle = "hidden"
    }
    const windowConfig = {
        x: x + 50,
        y: y + 50,
        width: 800,
        height: 600,
        icon: conf.getIconPath(),
        show: false,
        titleBarStyle: titleBarStyle,
        webPreferences: {
            preload: getPreloadPath("main.js"),
            scrollBounce: true,
            nodeIntegration: true,
        },
    };

    detailWindow = createWindow(windowConfig, 'detail.html');

    detailWindow.webContents.on('did-finish-load', () => {
        const cardDetails = db.getCardDetails(cardID);
        detailWindow.webContents.send('displayCardDetail', cardDetails);
    });

    detailWindow.on("closed", () => {
        detailWindow = null;
    });

    return detailWindow;
}

function createRegisterWindow() {
    if (!mainWindow) {
        throw new Error("Main window must be initialized before register window");
    }
    if (registerWindow) {
        registerWindow.show();
        return registerWindow;
    }

    const windowConfig = {
        width: 520,
        height: 300,
        icon: conf.getIconPath(),
        show: false,
        webPreferences: {
            preload: getPreloadPath("license.js"),
            scrollBounce: true,
            nodeIntegration: true,
        },
    };

    registerWindow = createWindow(windowConfig, 'license.html');
    registerWindow.setMenuBarVisibility(false);

    registerWindow.on("closed", () => {
        registerWindow = null;
    });

    return registerWindow;
}

function setupDevTools(window) {
    if (env.isDev()) {
        const contextMenu = require("electron-context-menu");
        contextMenu({
            prepend: function(defaultActions, params, browserWindow) {
                return [
                    { type: "separator" },
                ];
            },
        });
    }
}

function getSettingsWindow(){
    return settingsWindow
}

function getMainWindow(){
    return mainWindow
}

function getRegisterWindow() {
    return registerWindow
}

module.exports = {
    createMainWindow,
    createSettingsWindow,
    createDetailWindow,
    createRegisterWindow,
    duplicateMainWindow,
    getSettingsWindow,
    getRegisterWindow,
    getMainWindow,
    reloadAllMainWindow,
}