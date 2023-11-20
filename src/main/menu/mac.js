const {BrowserWindow, app} = require('electron');
const common = require("./common.js")

// Create the Application's main menu
function macTemplate() {
    let menuItems = [
        {
            label: 'Slippod',
            submenu: [
                {
                    label: 'About Slippod',
                    selector: 'orderFrontStandardAboutPanel:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Settings...',
                    accelerator: 'Command+,',
                    click: common.showSettingItem,
                },
                {
                    type: 'separator'
                },
                {
                    label: 'License...',
                    click: common.showLicenseItem,
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Hide',
                    click: common.minimizeItem,
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: common.appQuitItem,
                },
            ]
        },
        {
            label: 'File',
            submenu: [
                {
                    label: "New Card",
                    accelerator: 'Command+O',
                    click: common.openNewCardItem,
                },
                {
                    label: "Search",
                    accelerator: 'Command+K',
                    click: common.startSearchItem,
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Close Window',
                    accelerator: 'Command+W',
                    click: function () { 
                        if (BrowserWindow.getFocusedWindow() !== null) {
                            BrowserWindow.getFocusedWindow().close();
                        }
                    }
                },
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'Command+Z',
                    role: "undo",
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+Command+Z',
                    role: "redo",
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'Command+X',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'Command+C',
                    role: 'copy',
                },
                {
                    label: 'Paste',
                    accelerator: 'Command+V',
                    role:"paste",
                },
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    click: common.reloadItem,
                },
                {
                    label: 'Toggle DevTools',
                    click: common.toggleDevToolsItem,
                },
            ]
        },
        {
            label: 'Window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'Command+M',
                    click: common.minimizeItem,
                },
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Support',
                    click: common.supportItem,
                }
            ]
        },
    ];
    return menuItems
}

module.exports={
    macTemplate
}