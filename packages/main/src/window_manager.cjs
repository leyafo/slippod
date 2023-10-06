const {app, BrowserWindow} = require('electron');
const path = require('path');
const db = require('./db');
const { platform } = require('os');

console.log(import.meta.env.DEV);
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
        if (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined) {
            /**
             * Load from the Vite dev server for development.
             * 这里要小心，如果自己组装url时，tailwindow会无法正确加载，但html又可以。
             */
            const urlPath = new URL(
                entryPointHTML,
                import.meta.env.VITE_DEV_SERVER_URL).toString();
            window.loadURL(urlPath);
          } else {
            /**
             * Load from the local file system for production and test.
             *
             * Use BrowserWindow.loadFile() instead of BrowserWindow.loadURL() for WhatWG URL API limitations
             * when path contains special characters like `#`.
             * Let electron handle the path quirks.
             * @see https://github.com/nodejs/node/issues/12682
             * @see https://github.com/electron/electron/issues/6869
             */
            window.loadFile(path.resolve(__dirname, '../../renderer/dist/', entryPointHTML));
          }
    }

    getIconPath(){
        if (import.meta.env.DEV) {
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
            height: 600,
            minWidth: 400,
            minHeight: 400,
            titleBarStyle: "hidden",
            icon: this.getIconPath(),
            webPreferences: {
                preload: path.join(app.getAppPath(), 'packages/preload/dist/main_preload.cjs'),
                scrollBounce: true
            },
        };
    
        let activeWindow = BrowserWindow.getFocusedWindow();
        if (activeWindow) {
            let { x, y } = activeWindow.getBounds();
            windowConfig.x = x + 50;
            windowConfig.y = y + 50;
        }

        this.mainWindow = new BrowserWindow(windowConfig);
        this.#loadEntryPoint(this.mainWindow, 'index.html');
    
        if (import.meta.env.DEV) {
            const contextMenu = require("electron-context-menu");
            contextMenu({
                prepend: (defaultActions, params, browserWindow) => [
                    { type: "separator" },
                ],
            });
        }        
        this.mainWindow.once("ready-to-show", () => {
            this.mainWindow.show();
        });
    
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
                preload: path.join(app.getAppPath(), 'packages/preload/dist/settings_preload.cjs'),
                scrollBounce: true
            },
            parent: this.mainWindow,
            modal: true,
            show: true,
        });
        this.#loadEntryPoint(this.settingsWindow, 'setting.html');

        this.settingsWindow.on("closed", () => {
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
                    preload: path.join(app.getAppPath(), 'packages/preload/dist/main_preload.cjs'),
                    scrollBounce: true
                },
            });
        }
    
        if (!detailWindow) {
            // Handle the case where detailWindow is not initialized
            return;
        }
    
        this.#loadEntryPoint(detailWindow, `detail.html`);
    
        detailWindow.once("ready-to-show", () => {
            detailWindow.show();
        });
        detailWindow.webContents.on('did-finish-load', () => {
            const cardDetails = db.getCardDetails(cardID)
            detailWindow.webContents.send('displayCardDetail', cardDetails);
        });
    
        detailWindow.on("closed", () => {
            detailWindow = null;
        });
    
        return detailWindow;
    }

}

module.exports = WindowManager