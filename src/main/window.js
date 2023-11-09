const { app, BrowserWindow } = require('electron');
const path = require('path');
const db = require('./db.js');
const env = require('./env.js');

let mainWindow = null;
let settingsWindow = null;
let detailWindow = null; 
let registerWindow = null; 

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

function getIconPath() {
    // Default icon path
    let iconPath = path.join(app.getAppPath(), 'icons/icon.png');

    if (env.isDev()) {
        return ""; 
    }

    switch (process.platform) {
        case "win32":
            iconPath = path.join(app.getAppPath(), 'icons/icon.ico');
            break;
    }

    return iconPath;
}

function createMainWindow() {
    const windowConfig = {
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 300,
        titleBarStyle: "hidden",
        icon: getIconPath(),
        webPreferences: {
            preload: getPreloadPath("main.js"),
            scrollBounce: true,
            nodeIntegration: true,
        },
    };

    mainWindow = createWindow(windowConfig, 'index.html');
    setupDevTools(mainWindow);
    mainWindow.webContents.openDevTools()

    mainWindow.on("closed", function() {
        mainWindow = null;
    });


    return mainWindow;
}

function duplicateMainWindow(){
    const windowConfig = {
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 300,
        titleBarStyle: "hidden",
        icon: getIconPath(),
        webPreferences: {
            preload: getPreloadPath("main.js"),
            scrollBounce: true,
            nodeIntegration: true,
        },
    };

    let newMainWindow = createWindow(windowConfig, 'index.html');
    setupDevTools(newMainWindow);

    newMainWindow.on("closed", () => {
        newMainWindow = null;
    });

    return newMainWindow;
}

function createSettingsWindow() {
    if (!mainWindow) {
        throw new Error("Main window must be initialized before settings window");
    }

    const windowConfig = {
        width: 400,
        height: 400,
        icon: getIconPath(),
        parent: mainWindow,
        modal: true,
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
    if (!mainWindow) {
        throw new Error("Main window must be initialized before detail window");
    }

    const windowConfig = {
        width: 800,
        height: 600,
        icon: getIconPath(),
        parent: mainWindow,
        modal: true,
        show: false,
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

    const windowConfig = {
        width: 400,
        height: 400,
        icon: getIconPath(),
        parent: mainWindow,
        modal: true,
        show: false,
        webPreferences: {
            preload: getPreloadPath("register.js"),
            scrollBounce: true,
            nodeIntegration: true,
        },
    };

    registerWindow = createWindow(windowConfig, 'register.html');
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

module.exports = {
    createMainWindow,
    createSettingsWindow,
    createDetailWindow,
    createRegisterWindow,
    duplicateMainWindow,
    getSettingsWindow,
    getMainWindow,
}