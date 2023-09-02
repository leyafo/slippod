const { BrowserWindow, globalShortcut, Menu } = require('electron');
const path = require('path');


class WindowManager{
    constructor(){
        this.mainWindow = null
        this.settingsWindow = null
    }

    getResourceURL(...pathes) {
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

    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            titleBarStyle: "hidden",
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
            },
        });

        const url = this.getResourceURL("resource", "app", "index.html");
        this.mainWindow.loadURL(url);

        if (process.env.NODE_ENV === "development") {
            const contextMenu = require("electron-context-menu");
            contextMenu({
                prepend: (defaultActions, params, browserWindow) => [
                    { type: "separator" },
                ],
            });
        }

        globalShortcut.register("CommandOrControl+R", () => {
            console.log("CommandOrControl+R is pressed");
            this.mainWindow.reload();
        });

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
            webPreferences: {
                preload: path.join(__dirname, "settings_preload.js"),
            },
            parent: this.mainWindow,
            modal: true,
            show: true,
        });

        const url = this.getResourceURL("resource", "settings", "index.html");
        this.settingsWindow.loadURL(url);
        this.settingsWindow.on("closed", () => {
            this.settingsWindow = null;
        });
        this.settingsWindow.setMenuBarVisibility(false);

        return this.settingsWindow;
    }

    createMenu() {
        const template = [
            {
                label: "Application",
                submenu: [
                    {
                        label: "Settings",
                        click: () => {
                            if (this.settingsWindow === null) {
                                this.createSettingsWindow();
                            } else {
                                this.settingsWindow.show();
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
}

module.exports = WindowManager