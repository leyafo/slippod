const {app, BrowserWindow} = require('electron');
const path = require('path');
const db = require('./db.js');
const env = require('./env.js')

class WindowManager{
    constructor(){
        this.mainWindow = null
        this.settingsWindow = null
    }

    getMainWindow(){
        return this.mainWindow;
    }

    getSettingsWindow(){
        if(this.settingsWindow == null){
            this.settingsWindow = this.createSettingsWindow();
        }
        return this.settingsWindow;
    }

    #loadEntryPoint(window, entryPointHTML){
        const urlPath = env.getResourceURL(entryPointHTML)
        console.log(urlPath);
        if (env.isDev()) {
            window.loadURL(urlPath);
        } else {
            window.loadFile(urlPath);
        }
    }
    #getPreloadPath(fileName){
        return path.join(__dirname, `../preload/${fileName}`)
    }

    getIconPath(){
        if (env.isDev()){
            //use default icon for difference environment
            return ""
        }
        let iconPath = "";
        switch (process.platform) {
            case "darwin": {
                iconPath = path.join(app.getAppPath(), 'icons/icon.png')
                break
            }
            case "win32": {
                iconPath = path.join(app.getAppPath(), 'icons/icon.ico')
                break
            }
            case "linux": {
                iconPath = path.join(app.getAppPath(), 'icons/icon.png')
                break
            }
            default:{
                iconPath = path.join(app.getAppPath(), 'icons/icon.png')
                break
            }
        }
        console.log(iconPath)
        return iconPath
    }

    createMainWindow() {
        let windowConfig = {
            width: 800,
            height: 800,
            minWidth: 400,
            minHeight: 400,
            titleBarStyle: "hidden",
            icon: this.getIconPath(),
            webPreferences: {
                preload: this.#getPreloadPath("main.js"),
                scrollBounce: true,
                nodeIntegration: true,
            },
        };
    
        let activeWindow = BrowserWindow.getFocusedWindow();
        if (activeWindow) {
            let { x, y } = activeWindow.getBounds();
            windowConfig.x = x + 50;
            windowConfig.y = y + 50;
        }

        let mainWindow = new BrowserWindow(windowConfig);
        this.#loadEntryPoint(mainWindow, 'index.html');
    
        if (env.isDev()) {
            const contextMenu = require("electron-context-menu");
            contextMenu({
                prepend: function(defaultActions, params, browserWindow) {
                    return [
                        { type: "separator" },
                    ]
                } 
            });
        }        
        mainWindow.once("ready-to-show", function() {
            mainWindow.show();
        });
        this.mainWindow = mainWindow
    
        return this.mainWindow;
    }    

    createSettingsWindow() {
        if (this.mainWindow === null) {
            throw new Error("Main window must be initialized before settings window");
        }

        this.settingsWindow = new BrowserWindow({
            width: 400,
            height: 400,
            minWidth: 400,
            minHeight: 400,
            icon: this.getIconPath(),
            webPreferences: {
                preload: this.#getPreloadPath("setting.js"),
                scrollBounce: true,
                nodeIntegration: true,
            },
            parent: this.mainWindow,
            modal: true,
            show: true,
        });
        this.#loadEntryPoint(this.settingsWindow, 'setting.html');

        this.settingsWindow.on("closed", function()  {
            this.settingsWindow = null;
        });
        this.settingsWindow.setMenuBarVisibility(false);

        return this.settingsWindow;
    }

    createDetailWindow(cardID) {
        if (this.mainWindow === null) {
            throw new Error("Main window must be initialized before settings window");
        }
    
        let detailWindow;  // Define detailWindow here
    
        let activeWindow = BrowserWindow.getFocusedWindow();
        if (activeWindow) {
            let { x, y } = activeWindow.getBounds();
    
            detailWindow = new BrowserWindow({
                x: x + 50,
                y: y + 50,
                width: 800,
                height: 600,
                minWidth: 400,
                minHeight: 400,
                icon: this.getIconPath(),
                titleBarStyle: "hidden",
                webPreferences: {
                    preload: this.#getPreloadPath("main.js"),
                    scrollBounce: true,
                    nodeIntegration: true,
                },
            });
        }
    
        if (!detailWindow) {
            // Handle the case where detailWindow is not initialized
            return;
        }
    
        this.#loadEntryPoint(detailWindow, `detail.html`);
    
        detailWindow.once("ready-to-show", function()  {
            detailWindow.show();
        });
        detailWindow.webContents.on('did-finish-load', function()  {
            const cardDetails = db.getCardDetails(cardID)
            detailWindow.webContents.send('displayCardDetail', cardDetails);
        });
    
        detailWindow.on("closed", function()  {
            detailWindow = null;
        });
    
        return detailWindow;
    }

    createRegisterWindow(mainWindow){
        if (mainWindow === null) {
            throw new Error("Main window must be initialized before settings window");
        }

        let registerWindow = new BrowserWindow({
            width: 400,
            height: 400,
            minWidth: 400,
            minHeight: 400,
            icon: this.getIconPath(),
            parent: mainWindow,
            modal: true,
            show: true,
            webPreferences: {
                preload: this.#getPreloadPath("register.js"),
                nodeIntegration: true,
                scrollBounce: true
            },
        });
        if (!registerWindow) {
            // Handle the case where detailWindow is not initialized
            return null;
        }
        registerWindow.setMenuBarVisibility(false);
    
        this.#loadEntryPoint(registerWindow, `register.html`);

        registerWindow.once("ready-to-show", function()  {
            registerWindow.show();
        });
    
        registerWindow.on("closed", function()  {
            registerWindow = null;
        });
    
        return registerWindow;
    }

}

module.exports = WindowManager