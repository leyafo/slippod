const {BrowserWindow, app} = require('electron');
const common = require("./common.js")

// Create the Application's main menu
function macTemplate() {
    let menuItems = [
        {
            label: 'Slippod',
            submenu: [
                {
                    label: 'Settings...',
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
                    type: 'separator'
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
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'Command+Z',
                    selector: 'undo:',
                    role: "undo",
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+Command+Z',
                    selector: 'redo:',
                    role: "redo",
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'Command+X',
                    selector: 'cut:',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'Command+C',
                    selector: 'copy:',
                    role: 'copy',
                },
                {
                    label: 'Paste',
                    accelerator: 'Command+V',
                    selector: 'paste:',
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